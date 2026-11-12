// The edition changes all activity IDs. The browser runner derives its route and
// answer inventory from current content, preserving full UI/offline coverage.
const {spawnSync}=require('node:child_process');
const result=spawnSync('python3',['tests/browser-edition.py'],{stdio:'inherit'});
process.exit(result.status ?? 1);
