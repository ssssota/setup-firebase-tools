import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

export async function run() {
	const inputs = resolveInputs();
	const platform = getPlatform();
	const binUrl = getBinaryUrl(platform, inputs.version);
	core.info(`Download binary from ${binUrl} ...`);
	const binPath = await tc.downloadTool(binUrl);
	core.info(`Complete download to ${binPath} ...`);
	const binDir = path.dirname(binPath);
	const scriptPath = path.join(
		binDir,
		"firebase", // platform === "win" ? "firebase.bat" : "firebase",
	);
	const script = createScript(binPath, inputs.firebaseServiceAccount);
	await fs.writeFile(scriptPath, script);
	core.addPath(scriptPath);
}

export function resolveInputs() {
	const version = core.getInput("version");
	const firebaseServiceAccount = core.getInput("firebaseServiceAccount");
	return {
		version,
		firebaseServiceAccount: firebaseServiceAccount || undefined,
	} as const;
}

export function getPlatform() {
	const plat = os.platform();
	switch (plat) {
		case "win32":
			return "win";
		case "darwin":
			return "macos";
		case "linux":
			return "linux";
	}
	throw new Error(`Unsupported platform: ${plat}`);
}

export function getBinaryUrl(platform: string, version: string) {
	return `https://firebase.tools/bin/${platform}/${version}/`;
}

export function createScript(binPath: string, firebaseServiceAccount?: string) {
	return [
		"#!/bin/bash",
		firebaseServiceAccount &&
			`GOOGLE_APPLICATION_CREDENTIALS=${firebaseServiceAccount} \\`,
		`${binPath} "$@"`,
	].flatMap((line) => (typeof line === "string" ? [line] : []));
}
