/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = './uploads';

  constructor() {
    // Criar diretório base de uploads se não existir
    this.ensureDirectoryExists(this.uploadDir);

    // Garantir que todos os subdiretórios existam
    this.createUploadDirectories();
  }

  private createUploadDirectories(): void {
    // Lista de todos os diretórios de upload usados no aplicativo
    const directories = [
      'cnh',
      'antt',
      'user-photos',
      'empresa-logos',
      'veiculos',
      'contratos',
      'documentos',
    ];

    // Criar cada diretório
    directories.forEach((dir) => {
      this.ensureDirectoryExists(path.join(this.uploadDir, dir));
    });

    console.log('✓ Diretórios de upload criados/verificados com sucesso');
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Criado diretório: ${directory}`);
    }
  }

  async saveFile(file: Express.Multer.File, subdir: string): Promise<string> {
    // Garantir que o subdiretório exista
    const targetDir = path.join(this.uploadDir, subdir);
    this.ensureDirectoryExists(targetDir);

    // Gerar nome de arquivo único
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const targetPath = path.join(targetDir, fileName);

    // Salvar o arquivo
    await fs.promises.writeFile(targetPath, file.buffer);

    // Retornar o caminho relativo
    return `uploads/${subdir}/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    // Se o caminho for relativo (começa com 'uploads/'), converter para absoluto
    const absolutePath = filePath.startsWith('uploads/')
      ? `./${filePath}`
      : filePath;

    // Verificar se o arquivo existe
    try {
      await fs.promises.access(absolutePath);
      await fs.promises.unlink(absolutePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}
