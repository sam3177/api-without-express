import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stringifyData = (data: any) => JSON.stringify(data, null, 2);

export const lib = {
	baseDir: path.join(__dirname, '../.data'),
	create: (dir: string, file: string, data, callback) => {
		return fs.open(
			path.join(lib.baseDir, dir, file),
			'wx',
			(err, fileDescriptor) => {
				if (err || !fileDescriptor) {
					return callback(
						'could not create new file, maybe already exists!',
					);
				}
				//convert data to string
				const dataString = stringifyData(data);

				//write to file & close it
				fs.writeFile(fileDescriptor, dataString, (err) => {
					if (err) return callback('Could not write file.');
					fs.close(fileDescriptor, (err) => {
						if (err) return callback('Could not close file');
					});
					callback(false);
				});	
			},
		);
	},

	read: (
		dir: string,
		file: string,
		callback?: (err, data) => void,
	) => {
		let dataFromFile;
		fs.readFile(
			path.join(lib.baseDir, dir, file),
			'utf-8',
			(err, data) => {
				dataFromFile = data;
				callback && callback(err, data);
			},
		);
		return dataFromFile;
	},

	update: (dir: string, file: string, data: any, callback) => {
		fs.open(
			path.join(lib.baseDir, dir, file),
			'r+',
			(err, fileDescriptor) => {
				if (err || !fileDescriptor)
					return callback('Clould not open the file');

				const dataString = stringifyData(data);
				fs.ftruncate(fileDescriptor, (err) => {
					if (err) return callback('Error');
					fs.writeFile(fileDescriptor, dataString, (err) => {
						if (err) return callback('Error writing file');
						fs.close(fileDescriptor);
						callback(false);
					});
				});
			},
		);
	},

	delete: (dir: string, file: string, callback) => {
		return fs.unlink(path.join(lib.baseDir, dir, file), () => {
			callback(false);
		});
	},
};
