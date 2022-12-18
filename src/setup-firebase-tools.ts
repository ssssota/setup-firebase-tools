import * as core from "@actions/core";
import { run } from "./main";

run().catch((e) => {
	const message = e instanceof Error ? e.message : `${e}`;
	core.setFailed(message);
});
