import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { createBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'best@gmail.com',
      password: '123',
    };

    // signup test
    describe('Signup', () => {
      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('Should not signup when the email is not available', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('Should not signup when the password is not available', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.email })
          .expectStatus(400);
      });

      it('Should not signup when there is no payload', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });

    // signin test
    describe('Signin', () => {
      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('user_token', 'token');
      });

      it('Should not signin when the email is not available', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('Should not signin when the password is not available', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.email })
          .expectStatus(400);
      });

      it('Should not signin when there is no payload', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
    });
  });

  describe('User', () => {
    const dto: EditUserDto = {
      firstName: 'Augustine',
      lastName: 'Best',
    };
    describe('get user profile', () => {
      it('Should get the current user profile', () => {
        return pactum
          .spec()
          .get('/user/profile')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .expectStatus(200);
      });
    });

    describe('Update the current user', () => {
      it('Should update the current user details', () => {
        return pactum
          .spec()
          .patch('/user/profile')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create a bookmark', () => {
      const bookmark: createBookmarkDto = {
        title: 'Test bookmark',
        link: 'https://github.com/augustinebest',
        description: 'this is a test description',
      };
      it('Should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks/create')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .withBody(bookmark)
          .expectStatus(201)
          .expectBodyContains(bookmark.title)
          .expectBodyContains(bookmark.link)
          .expectBodyContains(bookmark.description);
      });
    });

    describe('Update a bookmark', () => {
      it('Should update a bookamrk', () => {
        const newBookmark: EditBookmarkDto = {
          title: 'New Test bookmark',
          link: 'https://twitter.com/augustinebest_',
        };
        return pactum
          .spec()
          .post('/bookmarks/create')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .withBody(newBookmark)
          .expectStatus(201)
          .expectBodyContains(newBookmark.title)
          .expectBodyContains(newBookmark.link)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get a bookmark', () => {
      it('Should get a bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Delete a bookmark', () => {
      it('Should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });

      it('Should not delete a bookamrk that does not exist', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '100')
          .withHeaders({ Authorization: 'Bearer $S{user_token}' })
          .expectStatus(403)
          .expectJsonLike({ message: 'This bookmark does not exists' });
      });
    });
  });
});
