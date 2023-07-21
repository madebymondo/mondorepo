import esbuild, { TransformOptions, TransformResult } from 'esbuild';
import fs from 'fs';

/**
 * Compiles the contents of a TypeScript file into JavaScript
 *
 * @param source File contents to compile
 * @param options TypeScript configuration options
 * @returns
 */
export async function tsCompile(
	source: string,
	options: TransformOptions | null = null
): Promise<string | undefined> {
	// Default options -- you could also perform a merge, or use the project tsconfig.json
	if (null === options) {
		options = {
			format: 'esm',
			platform: 'node',
			loader: 'ts',
			tsconfigRaw: {
				compilerOptions: {
					//@ts-ignore
					module: 'ESNext',
					moduleResolution: 'NodeNext',
					esModuleInterop: true,
				},
			},
		};
	}

	try {
		const compiledCode: TransformResult = await esbuild.transform(
			source,
			options ?? {}
		);

		return compiledCode.code;
	} catch (e) {
		console.error('Error compiling typescript file', e);
	}
}

/**
 * Gets the content of a TypeScript file
 *
 * @param filePath of TypeScript file to compile
 * @returns An object with the return value of each function in the file
 */
export async function compileAndRunTS(filePath: string): Promise<any> {
	const fileContents = fs.readFileSync(filePath, {
		encoding: 'utf-8',
	});

	const transpiledFile = await tsCompile(fileContents);
	let data = undefined;

	try {
		fs.writeFileSync(
			filePath.replace('.ts', '.js'),
			transpiledFile as string,
			{ encoding: 'utf-8' }
		);

		data = await import(filePath.replace('.ts', '.js'));
		fs.unlinkSync(filePath.replace('.ts', '.js'));
		return data;
	} catch (e) {
		console.error(
			`Error importing compiled typescript file: ${filePath}`,
			e
		);

		fs.unlinkSync(filePath.replace('.ts', '.js'));
	}
}
