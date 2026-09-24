import { l as loadProvider } from './load-provider-CdgAx3rL.js';

let enabled = false;
function triggerCommand(command, args = []) {
	return globalThis.__vitest_browser_runner__.commands.triggerCommand(command, args);
}
const mod = {
	async startCoverage() {
		if (enabled) {
			return;
		}
		enabled = true;
		await triggerCommand("__vitest_startV8Coverage");
	},
	async takeCoverage() {
		return triggerCommand("__vitest_takeV8Coverage", [window.location.href]);
	},
	stopCoverage() {
		// Browser mode should not stop coverage as same V8 instance is shared between tests
	},
	async getProvider() {
		return loadProvider();
	}
};

export { mod as default };
