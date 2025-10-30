import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { FullCourseData } from './interfaces/courses.interfaces';
import { PurchasesService } from '../purchases/purchases.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  rm: jest.fn(),
}));

jest.mock('fluent-ffmpeg', () =>
  jest.fn(() => {
    const handlers: Record<string, (err?: any) => void> = {};
    const chain: any = {
      outputOptions: jest.fn().mockImplementation(() => chain),
      output: jest.fn().mockImplementation(() => chain),
      on: jest.fn().mockImplementation((event: string, cb: (err?: any) => void) => {
        handlers[event] = cb;
        return chain;
      }),
      run: jest.fn().mockImplementation(() => {
        handlers['end']?.();
      }),
    };
    return chain;
  }),
);

const {
  mkdir: mkdirMock,
  readFile: readFileMock,
  writeFile: writeFileMock,
  rm: rmMock,
} = jest.requireMock('fs/promises') as Record<string, jest.Mock>;
const fluentFfmpegFactory = jest.requireMock('fluent-ffmpeg') as jest.Mock;

describe('CoursesService', () => {
  let service: CoursesService;
  const repositoryMock = {
    uploadCourse: jest.fn(),
    deleteCourse: jest.fn(),
  };
  const purchasesServiceMock = {
    hasUserPurchasedCourse: jest.fn(),
    registerPurchase: jest.fn(),
  };

  const sampleCourse: FullCourseData = {
    title: 'Sample course',
    description: 'Short description',
    longDescription: 'Long description of the course',
    image: 'image.png',
    price: '99.99',
    topics: ['topic1'],
    category: 'category',
    isSubtitled: true,
    language: 'es',
    isNew: false,
    includes: ['resource'],
    requirements: ['knowledge'],
    whatYouWillLearn: ['skill'],
    content: [
      {
        sectionTitle: 'Introducción',
        classes: [{ title: 'Bienvenida', duration: { hours: 0, minutes: 5 } }],
      },
    ],
    userReviews: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mkdirMock.mockReset();
    readFileMock.mockReset();
    writeFileMock.mockReset();
    rmMock.mockReset();
    fluentFfmpegFactory.mockClear();
    purchasesServiceMock.hasUserPurchasedCourse.mockReset();
    purchasesServiceMock.registerPurchase.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CoursesRepository, useValue: repositoryMock },
        { provide: PurchasesService, useValue: purchasesServiceMock },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a course through the repository', async () => {
    repositoryMock.uploadCourse.mockResolvedValue({ id: 1 });

    await service.createCourse(sampleCourse);

    expect(repositoryMock.uploadCourse).toHaveBeenCalledWith(sampleCourse);
  });

  it('uploads a course and triggers video conversions', async () => {
    repositoryMock.uploadCourse.mockResolvedValue({ id: 7 });
    const convertSpy = jest
      .spyOn(service, 'convertVideoToHLS')
      .mockResolvedValue(undefined);

    await service.uploadCourse(sampleCourse, '/tmp/full.mp4', '/tmp/preview.mp4');

    expect(repositoryMock.uploadCourse).toHaveBeenCalledWith(sampleCourse);
    expect(convertSpy).toHaveBeenNthCalledWith(1, 7, '/tmp/full.mp4', 'full');
    expect(convertSpy).toHaveBeenNthCalledWith(2, 7, '/tmp/preview.mp4', 'preview');
    expect(repositoryMock.deleteCourse).not.toHaveBeenCalled();
    convertSpy.mockRestore();
  });

  it('rolls back course creation when conversion fails', async () => {
    repositoryMock.uploadCourse.mockResolvedValue({ id: 9 });
    const convertSpy = jest
      .spyOn(service, 'convertVideoToHLS')
      .mockRejectedValue(new Error('ffmpeg failed'));

    await expect(
      service.uploadCourse(sampleCourse, '/tmp/full.mp4'),
    ).rejects.toThrow('Error al convertir video: ffmpeg failed');

    expect(repositoryMock.deleteCourse).toHaveBeenCalledWith(9);
    convertSpy.mockRestore();
  });

  it('converts full videos to HLS and rewrites segment paths', async () => {
    mkdirMock.mockResolvedValue(undefined);
    readFileMock.mockResolvedValue(`#EXTM3U
#EXTINF:10.0,
video1_segment000.ts
#EXT-X-ENDLIST`);
    writeFileMock.mockResolvedValue(undefined);

    const playlistPath = await service.convertFullVideoToHLS(
      3,
      'intro',
      'video1',
      '/videos/raw.mp4',
    );

    const expectedDir = path.join(process.cwd(), 'videos', '3', 'full', 'intro', 'video1');
    const expectedPlaylist = path.join(expectedDir, 'video1.m3u8');

    expect(mkdirMock).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(fluentFfmpegFactory).toHaveBeenCalledWith('/videos/raw.mp4');
    expect(readFileMock).toHaveBeenCalledWith(expectedPlaylist, 'utf8');

    const writtenContent = writeFileMock.mock.calls[0][1];
    expect(writtenContent).toContain('segment/video1_segment000.ts');
    expect(playlistPath).toBe(expectedPlaylist);
  });

  it('generates a master playlist for full course videos', async () => {
    mkdirMock.mockResolvedValue(undefined);
    readFileMock
      .mockResolvedValueOnce(`#EXTM3U
#EXTINF:9.1,
segment/video1_segment000.ts
#EXT-X-ENDLIST`)
      .mockResolvedValueOnce(`#EXTM3U
#EXTINF:5.5,
segment/video2_segment000.ts
#EXT-X-ENDLIST`);
    writeFileMock.mockResolvedValue(undefined);

    await service.generateFullMasterPlaylist(5, [
      {
        sectionId: 'intro',
        videoId: 'video1',
        playlistPath: '/tmp/intro/video1.m3u8',
      },
      {
        sectionId: 'module-1',
        videoId: 'video2',
        playlistPath: '/tmp/module-1/video2.m3u8',
      },
    ]);

    const expectedMasterPath = path.join(process.cwd(), 'videos', '5', 'full', 'full.m3u8');
    expect(mkdirMock).toHaveBeenCalledWith(path.join(process.cwd(), 'videos', '5', 'full'), {
      recursive: true,
    });
    expect(readFileMock).toHaveBeenNthCalledWith(1, '/tmp/intro/video1.m3u8', 'utf8');
    expect(readFileMock).toHaveBeenNthCalledWith(2, '/tmp/module-1/video2.m3u8', 'utf8');

    const [writePath, masterContent] = writeFileMock.mock.calls[0];
    expect(writePath).toBe(expectedMasterPath);
    expect(masterContent).toContain('#EXTM3U');
    expect(masterContent).toContain('#EXT-X-TARGETDURATION:10');
    expect(masterContent).toContain('intro/video1/segment/video1_segment000.ts');
    expect(masterContent).toContain('module-1/video2/segment/video2_segment000.ts');
  });

  it('confirms user access when purchase exists', async () => {
    purchasesServiceMock.hasUserPurchasedCourse.mockResolvedValue(true);

    await expect(service.userHasAccess(1, '20')).resolves.toBe(true);
    expect(purchasesServiceMock.hasUserPurchasedCourse).toHaveBeenCalledWith(1, 20);
  });

  it('throws ForbiddenException when user lacks purchase', async () => {
    purchasesServiceMock.hasUserPurchasedCourse.mockResolvedValue(false);

    await expect(service.userHasAccess(2, '15')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
