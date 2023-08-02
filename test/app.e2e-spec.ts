import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto, LoginDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';
import { Bookmark } from '@prisma/client';

const dto: AuthDto = {
  email: 'test@gmail.com',
  password: 'password',
  firstName: 'Firstname',
  lastName: 'Lastname'
};

const loginDto: LoginDto = {
  email: dto.email,
  password: dto.password,
};

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule]
      }).compile(); 

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();

    pactum.request.setBaseUrl("http://localhost:3333");
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should thrown an error if email empty', () => {
        return pactum.spec().post('/auth/signup')
                .withBody({...dto, email: ''})
                .expectStatus(400)
                .expectBodyContains('email should not be empty');
      });

      it('should thrown an error if invalid email format', () => {
        return pactum.spec().post('/auth/signup')
                .withBody({...dto, email: 'test'})
                .expectStatus(400)
                .expectBodyContains('email must be an email');
      });

      it('should thrown an error if empty password', () => {
        return pactum.spec().post('/auth/signup')
                .withBody({...dto, password: ''})
                .expectStatus(400)
                .expectBodyContains('password should not be empty');
      });

      it('should thrown an error if password does not meet the min length', () => {
        return pactum.spec().post('/auth/signup')
                .withBody({...dto, password: '12'})
                .expectStatus(400)
                .expectBodyContains('password must be longer than or equal to 6 characters');
      });

      it('should signup', () => {
        return pactum.spec().post('/auth/signup')
                .withBody(dto)
                .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should thrown an error if email empty', () => {
        return pactum.spec().post('/auth/signin')
                .withBody({...loginDto, email: ''})
                .expectStatus(400)
                .expectBodyContains('email should not be empty');
      });

      it('should thrown an error if invalid email format', () => {
        return pactum.spec().post('/auth/signin')
                .withBody({...loginDto, email: 'test'})
                .expectStatus(400)
                .expectBodyContains('email must be an email');
      });

      it('should thrown an error if empty password', () => {
        return pactum.spec().post('/auth/signin')
                .withBody({...loginDto, password: ''})
                .expectStatus(400)
                .expectBodyContains('password should not be empty');
      });

      it('should thrown an error if password does not meet the min length', () => {
        return pactum.spec().post('/auth/signin')
                .withBody({...loginDto, password: '12'})
                .expectStatus(400)
                .expectBodyContains('password must be longer than or equal to 6 characters');
      });

      it('should signin', () => {
        return pactum.spec().post('/auth/signin')
                .withBody(loginDto)
                .expectStatus(200)
                .stores('ACCESS_TOKEN', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('get signin user', () => {
      it('should get current user', () => {
        return pactum.spec()
                .get('/users/me')
                .withHeaders({
                  Authorization: 'Bearer $S{ACCESS_TOKEN}'
                })
                .expectStatus(200);
      });
    });

    const editUserDto: EditUserDto = {
      email: dto.email,
      firstName: 'Edited Firstname',
      lastName: 'Edited Lastname'
    };

    describe('Edit user', () => {
      it('should update user', () => {
        return pactum.spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{ACCESS_TOKEN}'
          })
          .withBody(editUserDto)
          .expectBodyContains(editUserDto.firstName)
          .expectBodyContains(editUserDto.lastName);

      });

      it('should update user firstname only', () => {
        return pactum.spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{ACCESS_TOKEN}'
          })
          .withBody({...editUserDto, lastName: ''})
          .expectStatus(200)
          .expectBodyContains(editUserDto.firstName);

      });
    });
  });

  describe('Bookmarks', () => {
    let dtoCreateBookmark: CreateBookmarkDto = {
      link: 'https://google.com#1',
      title: 'This is a title #1',
      description: ''
    };
    let dtoCreateBookmarkResponse: Bookmark = null;

    let dtoCreateBookmark2: CreateBookmarkDto = {
      link: 'https://google.com#2',
      title: 'This is a title #2',
      description: ''
    };
    let dtoCreateBookmark2Response: Bookmark = null;

    describe('create bookmark', () => {
      it('should thrown an error for unauthorized access', () => {
        return pactum.spec()
                .post('/bookmarks')
                .withBody(dtoCreateBookmark)
                .expectStatus(401);
      });

      it('should throw an error if empty link', () => {
        return pactum.spec()
                .post('/bookmarks')
                .withBody({...dtoCreateBookmark, link: ''})
                .withHeaders({
                  Authorization: 'Bearer $S{ACCESS_TOKEN}'
                })
                .expectStatus(400)
                .expectBodyContains('link should not be empty');
      });

      it('should throw an error if empty title', () => {
        return pactum.spec()
                .post('/bookmarks')
                .withBody({...dtoCreateBookmark, title: ''})
                .withHeaders({
                  Authorization: 'Bearer $S{ACCESS_TOKEN}'
                })
                .expectStatus(400)
                .expectBodyContains('title should not be empty');
      });

      it('should create bookmark #1', async () => {
        dtoCreateBookmarkResponse = await pactum.spec()
                .post('/bookmarks')
                .withBody(dtoCreateBookmark)
                .withHeaders({
                  Authorization: 'Bearer $S{ACCESS_TOKEN}'
                })
                .expectStatus(201)
                .expectBodyContains(dtoCreateBookmark.link)
                .expectBodyContains(dtoCreateBookmark.title)
                .returns((ctx) => {
                  return ctx.res.body;
                });

      });

      it('should create bookmark #2', async () => {
        dtoCreateBookmark2Response = await pactum.spec()
                .post('/bookmarks')
                .withBody(dtoCreateBookmark)
                .withHeaders({
                  Authorization: 'Bearer $S{ACCESS_TOKEN}'
                })
                .expectStatus(201)
                .expectBodyContains(dtoCreateBookmark.link)
                .expectBodyContains(dtoCreateBookmark.title)
                .returns((ctx) => {
                  return ctx.res.body;
                });
      });
    });

    describe('get all bookmarks', () => {
      it('should get all bookmarks', async () => {
        const body = await pactum.spec()
                  .get('/bookmarks')
                  .withHeaders({
                    Authorization: 'Bearer $S{ACCESS_TOKEN}'
                  })
                  .expectStatus(200)
                  .returns((ctx) => {
                    return ctx.res.body;
                  });

        expect(body.length).toEqual(2);
      })
    });

    describe('get bookmark', () => {
      it('should get first bookmark', async () => {
        const body = await pactum.spec()
                  .get('/bookmarks/{id}')
                  .withPathParams('id', dtoCreateBookmarkResponse.id)
                  .withHeaders({
                    Authorization: 'Bearer $S{ACCESS_TOKEN}'
                  })
                  .expectStatus(200)
                  .returns<Promise<Bookmark>>((ctx) => {
                    return ctx.res.body;
                  });

        expect(body.id).toEqual(dtoCreateBookmarkResponse.id);
        expect(body.title).toEqual(dtoCreateBookmarkResponse.title);
      });
      
      it('should get second bookmark', async () => {
        const body = await pactum.spec()
                  .get('/bookmarks/{id}')
                  .withPathParams('id', dtoCreateBookmark2Response.id)
                  .withHeaders({
                    Authorization: 'Bearer $S{ACCESS_TOKEN}'
                  })
                  .expectStatus(200)
                  .returns<Promise<Bookmark>>((ctx) => {
                    return ctx.res.body;
                  });

        expect(body.id).toEqual(dtoCreateBookmark2Response.id);
        expect(body.title).toEqual(dtoCreateBookmark2Response.title);
      });
    });
  });
});

