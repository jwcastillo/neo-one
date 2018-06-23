// @ts-ignore
import { codeFrameColumns } from '@babel/code-frame';
import { RawSourceMap, SourceMapConsumer } from 'source-map';

const MESSAGE_INDENT = '    ';

const getRenderedCallsite = (fileContent: string, line: number, column?: number) => {
  let renderedCallsite = codeFrameColumns(fileContent, { start: { column, line } }, { highlightCode: true });

  renderedCallsite = renderedCallsite
    .split('\n')
    .map((renderedLine: string) => MESSAGE_INDENT + renderedLine)
    .join('\n');

  renderedCallsite = `\n${renderedCallsite}\n`;

  return renderedCallsite;
};

const getSourceMapPosition = ({
  lineNumber,
  consumer,
}: {
  readonly lineNumber: number;
  readonly consumer: SourceMapConsumer;
}): string | undefined => {
  const { source, line, column } = consumer.originalPositionFor({ line: lineNumber, column: 0 });
  if (source === null || line === null) {
    return undefined;
  }

  const sourceContent = consumer.sourceContentFor(source, true);
  if (sourceContent === null) {
    return undefined;
  }

  return getRenderedCallsite(sourceContent, line, column === null ? undefined : column);
};

interface Options {
  readonly message: string;
  readonly sourceMap?: RawSourceMap;
}

export const processError = async ({ message, sourceMap }: Options): Promise<string> => {
  if (sourceMap === undefined) {
    return message;
  }

  return SourceMapConsumer.with(sourceMap, undefined, async (consumer) => {
    const splitMessage = message.trim().split('\n');
    const line = splitMessage.find((splitLine) => splitLine.startsWith('Line:'));
    if (line !== undefined) {
      const errorMessage = splitMessage.filter((splitLine) => !splitLine.startsWith('Line:')).join('\n');
      const lineNumber = parseInt(line.split(':')[1], 10);
      const positionMessage = getSourceMapPosition({ lineNumber, consumer });

      return positionMessage === undefined ? errorMessage : `${errorMessage}\n${positionMessage}`;
    }

    return message;
  });
};