import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as path from 'path';
import { Request, Response } from 'express';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { FullCourseData } from './interfaces/courses.interfaces';
import { PurchasesService } from 'src/purchases/purchases.service';
import * as unzipper from 'unzipper';

jest.mock('unzipper', () => ({
  Extract: jest.fn(),
}));
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    createReadStream: jest.fn(),
  };
});

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
    getAllCourses: jest.Mock;
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
      getAllCourses: jest.fn(),
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

  it('returns all courses', async () => {
    const res = responseMock();
    const data = [{ id: 1, title: 'Course' }];
    coursesServiceMock.getAllCourses.mockResolvedValue(data);

    await controller.getCourses(res as Response);

    expect(coursesServiceMock.getAllCourses).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(data);
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

  describe('uploadCourseZip', () => {
    const createZipFile = () =>
      createFile({
        fieldname: 'courseZip',
        path: '/tmp/course.zip',
        originalname: 'course.zip',
      });

    const setupExtraction = () => {
      const extractStream = {
        on: jest.fn((event: string, handler: () => void) => {
          if (event === 'close') {
            handler();
          }
          return extractStream;
        }),
      };
      (unzipper.Extract as jest.Mock).mockReturnValue(extractStream);
      const createReadStreamMock = fs.createReadStream as jest.Mock;
      createReadStreamMock.mockReturnValue({
        pipe: jest.fn().mockReturnValue(extractStream),
      });
      return { extractStream, createReadStreamMock };
    };

    it('procesa el zip completo y genera playlists y subtítulos', async () => {
      const now = 1_700_000_000_000;
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
      const extractPath = path.join(process.cwd(), 'uploads', 'tmp', String(now));
      const file = createZipFile();
      const req = { user: { role: 'admin' } } as any;
      const res = responseMock();

      const { createReadStreamMock } = setupExtraction();

      const mkdirSpy = jest
        .spyOn(fsp, 'mkdir')
        .mockResolvedValue(undefined as any);
      const rmSpy = jest.spyOn(fsp, 'rm').mockResolvedValue(undefined as any);
      const accessSpy = jest
        .spyOn(fsp, 'access')
        .mockResolvedValue(undefined as any);
      const readFileSpy = jest
        .spyOn(fsp, 'readFile')
        .mockResolvedValueOnce(JSON.stringify(sampleCourse));

      const readdirSpy = jest
        .spyOn(fsp, 'readdir')
        .mockImplementation(async (dir: any) => {
          if (dir === extractPath) {
            return ['preview.mp4', 'preview_es.vtt', 'Intro'] as any;
          }
          throw new Error(`Unexpected readdir path: ${dir}`);
        });

      const copyFileSpy = jest
        .spyOn(fsp, 'copyFile')
        .mockResolvedValue(undefined as any);

      const getAllFilesSpy = jest
        .spyOn(controller as any, 'getAllFilesRecursive')
        .mockResolvedValue([
          path.join(extractPath, 'Intro', 'Welcome.mp4'),
          path.join(extractPath, 'Intro', 'Welcome-es.vtt'),
        ]);

      coursesServiceMock.createCourse.mockResolvedValue({ id: 123 });
      coursesServiceMock.convertVideoToHLS.mockResolvedValue(undefined);
      coursesServiceMock.convertFullVideoToHLS.mockResolvedValue(
        '/videos/123/full/intro/welcome/playlist.m3u8',
      );
      coursesServiceMock.generateFullMasterPlaylist.mockResolvedValue(
        undefined,
      );

      await controller.uploadCourseZip(file, req, res as Response);

      const previewPath = path.join(extractPath, 'preview.mp4');
      expect(coursesServiceMock.createCourse).toHaveBeenCalledWith(
        sampleCourse,
      );
      expect(coursesServiceMock.convertVideoToHLS).toHaveBeenCalledWith(
        123,
        previewPath,
        'preview',
      );
      expect(coursesServiceMock.convertFullVideoToHLS).toHaveBeenCalledWith(
        123,
        'intro',
        'welcome',
        path.join(extractPath, 'Intro', 'Welcome.mp4'),
      );
      expect(coursesServiceMock.generateFullMasterPlaylist).toHaveBeenCalledWith(
        123,
        [
          {
            sectionId: 'intro',
            videoId: 'welcome',
            playlistPath: '/videos/123/full/intro/welcome/playlist.m3u8',
          },
        ],
      );

      expect(copyFileSpy).toHaveBeenCalledWith(
        path.join(extractPath, 'preview_es.vtt'),
        path.join(process.cwd(), 'videos', '123', 'preview', 'preview_es.vtt'),
      );
      expect(copyFileSpy).toHaveBeenCalledWith(
        path.join(extractPath, 'Intro', 'Welcome-es.vtt'),
        path.join(
          process.cwd(),
          'videos',
          '123',
          'full',
          'intro',
          'welcome',
          'Welcome-es.vtt',
        ),
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Curso subido y procesado correctamente',
        courseId: 123,
      });
      expect(fsp.rm).toHaveBeenCalledWith(extractPath, {
        recursive: true,
        force: true,
      });
      expect(fsp.rm).toHaveBeenCalledWith(file.path, expect.any(Object));
      expect(fsp.readdir).toHaveBeenCalledWith(extractPath);

      dateSpy.mockRestore();
      createReadStreamMock.mockReset();
      (unzipper.Extract as jest.Mock).mockReset();
      readdirSpy.mockRestore();
      getAllFilesSpy.mockRestore();
      mkdirSpy.mockRestore();
      rmSpy.mockRestore();
      accessSpy.mockRestore();
      readFileSpy.mockRestore();
      copyFileSpy.mockRestore();
    });

    it('rechaza la subida en zip cuando el usuario no es admin', async () => {
      const file = createZipFile();
      const req = { user: { role: 'student' } } as any;
      const res = responseMock();

      await expect(
        controller.uploadCourseZip(file, req, res as Response),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('devuelve bad request si el zip no contiene videos completos', async () => {
      const now = 1_700_000_000_100;
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
      const extractPath = path.join(process.cwd(), 'uploads', 'tmp', String(now));
      const file = createZipFile();
      const req = { user: { role: 'admin' } } as any;
      const res = responseMock();
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      const { createReadStreamMock } = setupExtraction();

      const mkdirSpy = jest
        .spyOn(fsp, 'mkdir')
        .mockResolvedValue(undefined as any);
      const rmSpy = jest.spyOn(fsp, 'rm').mockResolvedValue(undefined as any);
      const accessSpy = jest
        .spyOn(fsp, 'access')
        .mockResolvedValue(undefined as any);
      const readFileSpy = jest
        .spyOn(fsp, 'readFile')
        .mockResolvedValueOnce(JSON.stringify(sampleCourse));
      const readdirSpy = jest
        .spyOn(fsp, 'readdir')
        .mockResolvedValue(['preview.mp4', 'Intro'] as any);
      const getAllFilesSpy = jest
        .spyOn(controller as any, 'getAllFilesRecursive')
        .mockResolvedValue([]);

      coursesServiceMock.createCourse.mockResolvedValue({ id: 321 });
      coursesServiceMock.convertVideoToHLS.mockResolvedValue(undefined);
      coursesServiceMock.convertFullVideoToHLS.mockResolvedValue(undefined);
      coursesServiceMock.generateFullMasterPlaylist.mockResolvedValue(
        undefined,
      );

      await controller.uploadCourseZip(file, req, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El archivo ZIP no contiene videos completos para el curso.',
      });
      expect(fsp.rm).toHaveBeenCalledWith(extractPath, {
        recursive: true,
        force: true,
      });
      expect(fsp.rm).toHaveBeenCalledWith(file.path, expect.any(Object));
      expect(coursesServiceMock.generateFullMasterPlaylist).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
      dateSpy.mockRestore();
      createReadStreamMock.mockReset();
      (unzipper.Extract as jest.Mock).mockReset();
      mkdirSpy.mockRestore();
      rmSpy.mockRestore();
      accessSpy.mockRestore();
      readFileSpy.mockRestore();
      readdirSpy.mockRestore();
      getAllFilesSpy.mockRestore();
    });
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
