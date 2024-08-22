import { DifferenceImageData } from '@app/class/algorithms/difference-locator/difference-locator.constants';
import { Card } from '@common/interfaces/game-card/card';
import * as fs from 'fs';
import Jimp from 'jimp';
import * as rimraf from 'rimraf';
import FileSystemManager from './file-system-manager';

namespace FileSystemManagerSpy {
    export const createDirectory = jest.fn();
    export const removeDirectory = jest.fn();
    export const storeCards = jest.fn();
    export const createRealDirectory = FileSystemManager.createDirectory;
    export const removeRealDirectory = FileSystemManager.removeDirectory;
    export const storeRealCards = FileSystemManager.storeCards;
}

namespace fsSpy {
    export const existsSync = jest.spyOn(fs, 'existsSync').mockImplementation();
    export const mkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation();
    export const readFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation();
}

jest.mock('fs');
jest.mock('rimraf');
describe('FileSystemManager', () => {
    const path = './assets/tests/tmpCard';
    const name = 'name';

    beforeAll(() => {
        FileSystemManager.createDirectory = FileSystemManagerSpy.createDirectory;
        FileSystemManager.removeDirectory = FileSystemManagerSpy.createDirectory;
        FileSystemManager.storeCards = FileSystemManagerSpy.createDirectory;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createDirectory', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        beforeAll(() => {
            FileSystemManager.createDirectory = FileSystemManagerSpy.createRealDirectory;
        });

        afterAll(() => {
            FileSystemManager.createDirectory = FileSystemManagerSpy.createDirectory;
        });

        it("should create a directory if it doesn't exist", () => {
            fsSpy.existsSync.mockReturnValueOnce(false);
            expect(FileSystemManager.createDirectory(path, name)).toBeTruthy();
            expect(fsSpy.mkdirSync).toHaveBeenCalledTimes(1);
        });

        it('should not create a directory if it exist', () => {
            fsSpy.existsSync.mockReturnValueOnce(true);
            expect(FileSystemManager.createDirectory(path, name)).toBeFalsy();
            expect(fsSpy.mkdirSync).not.toHaveBeenCalled();
        });
    });

    describe('removeDirectory', () => {
        beforeAll(() => {
            FileSystemManager.removeDirectory = FileSystemManagerSpy.removeRealDirectory;
        });

        afterAll(() => {
            FileSystemManager.removeDirectory = FileSystemManagerSpy.removeDirectory;
        });

        it('should call rimraf.sync', () => {
            const rimrafSync = jest.spyOn(rimraf, 'sync').mockImplementationOnce(jest.fn());
            FileSystemManager.removeDirectory(path);
            expect(rimrafSync).toHaveBeenCalledWith(path);
        });
    });

    describe('storeCards', () => {
        let creationData: DifferenceImageData;

        beforeAll(() => {
            FileSystemManager.storeCards = FileSystemManagerSpy.storeRealCards;
            jest.spyOn(Jimp.prototype, 'write').mockImplementation(jest.fn());
        });

        afterAll(() => {
            FileSystemManager.storeCards = FileSystemManagerSpy.storeCards;
        });

        beforeEach(() => {
            creationData = {
                originalImage: {
                    write: jest.fn(),
                } as unknown as Jimp,
                modifiedImage: {
                    write: jest.fn(),
                } as unknown as Jimp,
                differencePixelSets: [[{ colors: [0], y: 0, start: 0, end: 1 }]],
            };
        });

        it('should store a card on the server', () => {
            FileSystemManagerSpy.createDirectory.mockReturnValue(true);
            jest.spyOn(Jimp.prototype, 'setPixelColor').mockImplementation(jest.fn());
            expect(FileSystemManager.storeCards(name, creationData)).toBeTruthy();
        });

        it('should not store a card on the server because it already exists', () => {
            FileSystemManagerSpy.createDirectory.mockReturnValue(false);
            expect(FileSystemManager.storeCards(name, creationData)).toBeFalsy();
        });

        it('should not store a card on the server because an error occurred', () => {
            FileSystemManagerSpy.createDirectory.mockReturnValueOnce(true).mockReturnValueOnce(false);
            expect(FileSystemManager.storeCards(name, creationData)).toBeFalsy();
        });
    });

    describe('getImages', () => {
        const card = {
            id: 'id',
            differenceNbr: 1,
        } as unknown as Card;

        it('should generate the card Files', () => {
            fsSpy.readFileSync.mockReturnValue('file');
            expect(FileSystemManager.getImages(card)).toEqual({
                id: 'id',
                originalImage: 'file',
                modifiedImage: 'file',
                differencesBase64Files: [
                    {
                        differenceImage: 'file',
                        flashImage: 'file',
                    },
                ],
            });
        });

        it('should return undefined', () => {
            fsSpy.readFileSync.mockImplementation(() => {
                throw new Error('error');
            });
            expect(FileSystemManager.getImages(card)).toEqual(undefined);
        });
    });
});
