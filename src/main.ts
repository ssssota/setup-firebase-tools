import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { v4 as uuid } from "uuid";

export async function run() {
	const inputs = resolveInputs();
	const platform = getPlatform();
	const binUrl = getBinaryUrl(platform, inputs.version);
	core.info(`Download binary from ${binUrl} ...`);
	const tempBinPath = await tc.downloadTool(binUrl);
	await fs.chmod(tempBinPath, "755");
	const tempDir = path.dirname(tempBinPath);
	core.info(`Complete download to ${tempBinPath} ...`);
	const binDir = path.join(tempDir, uuid());
	await fs.mkdir(binDir, { recursive: true });
	const firebaseServiceAccount = path.join(binDir, "service-account.json");
	if (inputs.firebaseServiceAccount) {
		await fs.writeFile(firebaseServiceAccount, inputs.firebaseServiceAccount);
		core.exportVariable(
			"GOOGLE_APPLICATION_CREDENTIALS",
			firebaseServiceAccount,
		);
	}
	const binPath = path.join(
		binDir,
		platform === "win" ? "firebase.exe" : "firebase",
	);
	await fs.rename(tempBinPath, binPath);
	core.addPath(binDir);
}

export function resolveInputs() {
	const version = core.getInput("version");
	const firebaseServiceAccount = core.getInput("firebaseServiceAccount");
	if (firebaseServiceAccount) core.setSecret(firebaseServiceAccount);
	return {
		version,
		firebaseServiceAccount: firebaseServiceAccount || undefined,
	} as const;
}

export function getPlatform() {
	const platform = os.platform();
	switch (platform) {
		case "win32":
			return "win";
		case "darwin":
			return "macos";
		case "linux":
			return "linux";
	}
	throw new Error(`Unsupported platform: ${platform}`);
}

export function getBinaryUrl(platform: string, version: string) {
	return `https://firebase.tools/bin/${platform}/${version}/`;
}
