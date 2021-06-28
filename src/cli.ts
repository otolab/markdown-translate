import meow from 'meow';
import getStdin from 'get-stdin';
import { translate } from './index';
import fsPromises from 'fs/promises';

const usage = `
    Usage
      $ markdown-translate [options] [<file> ...]
 
    Options
      --deepl-auth-key <key>  deepl api auth key
      --help                  help

    Environments
      DEEPL_AUTH_KEY          deepl api auth key

    Examples
      $ markdown-translate test.md
`;

export const cli = meow(usage, {
  flags: {
    deeplAuthKey: {
      type: 'string',
      default: '',
    },
  },
  autoHelp: true,
  autoVersion: true,
});

export const run = async (
  input = cli.input,
  flags = cli.flags
): Promise<{ exitStatus: number; stdout: string | null; stderr: Error | null }> => {
  let content: string = '';
  if (input.length) {
    let fname: string | undefined;
    while ((fname = input.shift())) {
      const handler = await fsPromises.open(fname, 'r');
      content += await handler.readFile({ encoding: 'utf8' });
      await handler.close();
    }
  } else {
    content = await getStdin();
  }

  const result = await translate(
    content,
    { targetLang: 'ja', authKey: flags.deeplAuthKey || process.env.DEEPL_AUTH_KEY || '', useFreeApi: false },
    { tooLongThreshold: 500 }
  );

  // output
  console.log(result);

  return {
    stdout: null,
    stderr: null,
    exitStatus: 0,
  };
};