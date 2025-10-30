import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fsp } from 'fs';
import * as path from 'path';
import { Request, Response } from 'express';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { FullCourseData } from './interfaces/courses.interfaces';
import { PurchasesService } from 'src/purchases/purchases.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesServiceMock: {
    userHasAccess: jest.Mock;
    createCourse: jest.Mock;
    convertVideoToHLS: jest.Mock;
    convertFullVideoToHLS: jest.Mock;
    generateFullMasterPlaylist: jest.Mock;
    uploadCourse: jest.Mock;
    findCourseById: jest.Mock;
  };
  let purchasesServiceMock: {
    hasUserPurchasedCourse: jest.Mock;
    registerPurchase: jest.Mock;
  };

  type MockResponse = Response & {
    status: jest.Mock<any, any>;
    json: jest.Mock<any, any>;
    sendFile: jest.Mock<any, any>;
  };

  const responseMock = (): MockResponse => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendFile: jest.fn(),
    } as any;
    return res;
  };

  const createFile = (
    overrides: Partial<Express.Multer.File>,
  ): Express.Multer.File =>
    ({
      fieldname: overrides.fieldname ?? 'file',
      originalname: overrides.originalname ?? 'video.mp4',
      encoding: overrides.encoding ?? '7bit',
      mimetype: overrides.mimetype ?? 'video/mp4',
      size: overrides.size ?? 10,
      destination: overrides.destination ?? '/tmp',
      filename: overrides.filename ?? 'video.mp4',
      path: overrides.path ?? '/tmp/video.mp4',
      buffer: overrides.buffer ?? Buffer.from([]),
      stream: overrides.stream ?? ({} as any),
    } as Express.Multer.File);

  const sampleCourse: FullCourseData = {
    title: 'Sample course',
    description: 'Short description',
    longDescription: 'Long description',
    image: 'image.jpg',
    price: '10',
    topics: ['topic'],
    category: 'category',
    isSubtitled: true,
    language: 'es',
    isNew: false,
    includes: ['resource'],
    requirements: ['req'],
    whatYouWillLearn: ['skill'],
    content: [
      {
        sectionTitle: 'Intro',
        classes: [{ title: 'Welcome', duration: { hours: 0, minutes: 5 } }],
      },
    ],
    userReviews: [],
  };

  beforeEach(async () => {
    coursesServiceMock = {
      userHasAccess: jest.fn(),
      createCourse: jest.fn(),
      convertVideoToHLS: jest.fn(),
      convertFullVideoToHLS: jest.fn(),
      generateFullMasterPlaylist: jest.fn(),
      uploadCourse: jest.fn(),
      findCourseById: jest.fn(),
    };

    purchasesServiceMock = {
      hasUserPurchasedCourse: jest.fn(),
      registerPurchase: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: coursesServiceMock },
        { provide: PurchasesService, useValue: purchasesServiceMock },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('serves the full playlist when the user has access', async () => {
    coursesServiceMock.userHasAccess.mockResolvedValue(true);
    const accessSpy = jest.spyOn(fsp, 'access').mockResolvedValue(undefined as any);

    const req = { user: { id: 42 } } as any;
    const res = responseMock();

    await controller.getFullPlaylist('10', req, res as Response);

    const expectedPath = path.join(process.cwd(), 'videos', '10', 'full', 'full.m3u8');
    expect(coursesServiceMock.userHasAccess).toHaveBeenCalledWith(42, '10');
    expect(res.sendFile).toHaveBeenCalledWith(expectedPath);

    accessSpy.mockRestore();
  });

  it('throws UnauthorizedException when user is missing in protected route', async () => {
    const res = responseMock();

    await expect(
      controller.getFullPlaylist('10', {} as any, res as Response),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws ForbiddenException when user lacks access', async () => {
    coursesServiceMock.userHasAccess.mockResolvedValue(false);
    const req = { user: { id: 13 } } as any;
    const res = responseMock();

    await expect(
      controller.getFullPlaylist('10', req, res as Response),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('uploads course data manually when user is admin', async () => {
    coursesServiceMock.uploadCourse.mockResolvedValue(undefined);
    const req = { user: { role: 'admin' } } as any;
    const res = responseMock();
    const files = {
      fullVideo: [createFile({ fieldname: 'fullVideo', path: '/tmp/full.mp4' })],
      previewVideo: [createFile({ fieldname: 'previewVideo', path: '/tmp/preview.mp4' })],
    };

    await controller.uploadCourse(files, JSON.stringify(sampleCourse), req, res as Response);

    expect(coursesServiceMock.uploadCourse).toHaveBeenCalledWith(
      sampleCourse,
      '/tmp/full.mp4',
      '/tmp/preview.mp4',
    );
    expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Curso y preview subidos y procesados correctamente',
    });
  });

  it('denies manual upload to non-admin users', async () => {
    const req = { user: { role: 'student' } } as any;
    const res = responseMock();
    const files = { fullVideo: [createFile({ fieldname: 'fullVideo', path: '/tmp/full.mp4' })] };

    await expect(
      controller.uploadCourse(files, JSON.stringify(sampleCourse), req, res as Response),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('responds with bad request when full video is missing', async () => {
    coursesServiceMock.uploadCourse.mockResolvedValue(undefined);
    const req = { user: { role: 'admin' } } as any;
    const res = responseMock();
    const files = {
      previewVideo: [createFile({ fieldname: 'previewVideo', path: '/tmp/preview.mp4' })],
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await controller.uploadCourse(files, JSON.stringify(sampleCourse), req, res as Response);

    expect(coursesServiceMock.uploadCourse).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({ message: 'Falta el video completo' });
    consoleSpy.mockRestore();
  });

  it('serves a full video playlist with section and video ids', async () => {
    coursesServiceMock.userHasAccess.mockResolvedValue(true);
    const accessSpy = jest.spyOn(fsp, 'access').mockResolvedValue(undefined as any);
    const req = { user: { id: 1 } } as any;
    const res = responseMock();

    await controller.getFullVideoPlaylist('2', 'intro', 'video1', req, res as Response);

    const expectedPath = path.join(
      process.cwd(),
      'videos',
      '2',
      'full',
      'intro',
      'video1',
      'video1.m3u8',
    );
    expect(res.sendFile).toHaveBeenCalledWith(expectedPath);

    accessSpy.mockRestore();
  });

  describe('buyCourse', () => {
    const reqWithUser = (overrides: Partial<Request> & { user?: any } = {}): Request =>
      ({
        ...overrides,
        user: overrides.user ?? { id: 5 },
      } as any);

    it('throws UnauthorizedException when user is missing', async () => {
      const res = responseMock();

      await expect(
        controller.buyCourse('1', {} as any, res as Response),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws NotFoundException when course does not exist', async () => {
      coursesServiceMock.findCourseById.mockResolvedValue(null);
      const res = responseMock();

      await expect(
        controller.buyCourse('99', reqWithUser(), res as Response),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(coursesServiceMock.findCourseById).toHaveBeenCalledWith(99);
    });

    it('throws ConflictException when user already purchased the course', async () => {
      coursesServiceMock.findCourseById.mockResolvedValue({ id: 3, title: 'Curso', price: 10 });
      purchasesServiceMock.hasUserPurchasedCourse.mockResolvedValue(true);
      const res = responseMock();

      await expect(
        controller.buyCourse('3', reqWithUser(), res as Response),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(purchasesServiceMock.hasUserPurchasedCourse).toHaveBeenCalledWith(5, 3);
    });

    it('registers purchase and responds with course data when happy path succeeds', async () => {
      const course = { id: 7, title: 'Curso Avanzado', price: 25 };
      coursesServiceMock.findCourseById.mockResolvedValue(course);
      purchasesServiceMock.hasUserPurchasedCourse.mockResolvedValue(false);
      purchasesServiceMock.registerPurchase.mockResolvedValue(undefined);
      const res = responseMock();

      await controller.buyCourse('7', reqWithUser(), res as Response);

      expect(purchasesServiceMock.registerPurchase).toHaveBeenCalledWith(5, 7);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Curso comprado exitosamente',
        course: { title: course.title, price: course.price },
      });
    });
  });
});
