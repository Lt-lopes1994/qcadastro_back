/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Garante que o diretório de uploads existe
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(path.join(this.uploadDir, 'cnh'));
    this.ensureDirectoryExists(path.join(this.uploadDir, 'antt'));
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    type: 'cnh' | 'antt',
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, type, fileName);

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`uploads/${type}/${fileName}`);
        }
      });
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}
