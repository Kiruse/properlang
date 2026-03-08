import type { TokenType, CustomPatternMatcherFunc, IMultiModeLexerDefinition, IToken } from 'chevrotain';
import { Lexer } from 'chevrotain';
import { ProperLangLanguageMetaData } from './generated/language-server/module.js';
import { ProperLangGrammar } from './generated/language-server/grammar.js';
import { ProperLangAstReflection } from './generated/language-server/ast.js';
import { createParser, DefaultLexer, DefaultLexerErrorMessageProvider, LangiumParserErrorMessageProvider, LangiumParser, DefaultLangiumProfiler, DefaultTokenBuilder } from 'langium';
import type { LexerResult } from 'langium';

const INTERPOLATION_MODE = 'interpolation';

function buildMultiModeTokens(): { multiMode: IMultiModeLexerDefinition; allTokens: TokenType[]; tokenDict: Record<string, TokenType> } {
  const grammar = ProperLangGrammar();
  const tokenBuilder = new DefaultTokenBuilder();
  const tokens = tokenBuilder.buildTokens(grammar, { caseInsensitive: ProperLangLanguageMetaData.caseInsensitive }) as TokenType[];
  
  const defaultTokens: TokenType[] = [];
  const interpolationTokens: TokenType[] = [];
  const tokenDict: Record<string, TokenType> = {};
  
  for (const token of tokens) {
    tokenDict[token.name] = token;
    
    if (token.name === 'TPL_START') {
      const tplStart = { ...token, PUSH_MODE: INTERPOLATION_MODE };
      defaultTokens.push(tplStart);
      tokenDict[token.name] = tplStart;
    } else if (token.name === 'TPL_END') {
      const tplEnd = { ...token, POP_MODE: true };
      interpolationTokens.push(tplEnd);
      tokenDict[token.name] = tplEnd;
    } else if (token.name === 'TPL_BTWN') {
      interpolationTokens.push(token);
    } else if (token.name === 'TPL_FULL') {
      defaultTokens.push(token);
    } else {
      defaultTokens.push(token);
      interpolationTokens.push(token);
    }
  }
  
  const multiMode: IMultiModeLexerDefinition = {
    modes: {
      defaultMode: defaultTokens,
      [INTERPOLATION_MODE]: interpolationTokens
    },
    defaultMode: 'defaultMode'
  };
  
  return { multiMode, allTokens: tokens, tokenDict };
}

class MultiModeLexer {
  private readonly chevrotainLexer: Lexer;
  private readonly tokenTypes: Record<string, TokenType>;
  
  constructor(multiModeDef: IMultiModeLexerDefinition, tokenDict: Record<string, TokenType>) {
    this.chevrotainLexer = new Lexer(multiModeDef, {
      positionTracking: 'full',
      ensureOptimizations: false
    });
    this.tokenTypes = tokenDict;
  }
  
  get definition(): Record<string, TokenType> {
    return this.tokenTypes;
  }
  
  tokenize(text: string): LexerResult {
    const result = this.chevrotainLexer.tokenize(text);
    const hidden: IToken[] = [];
    const tokens: IToken[] = [];
    
    for (const token of result.tokens) {
      const tokenType = token.tokenType as TokenType;
      if (tokenType.GROUP === 'hidden' || tokenType.GROUP === Lexer.SKIPPED) {
        hidden.push(token);
      } else {
        tokens.push(token);
      }
    }
    
    return {
      tokens,
      hidden,
      errors: result.errors
    };
  }
}

export function createProperLangParser(): LangiumParser {
  const grammar = ProperLangGrammar();
  const lexerErrorMessageProvider = new DefaultLexerErrorMessageProvider();
  const parserErrorMessageProvider = new LangiumParserErrorMessageProvider();
  const langiumProfiler = new DefaultLangiumProfiler();

  const sharedServices = {
    AstReflection: new ProperLangAstReflection(),
    profilers: {
      LangiumProfiler: langiumProfiler
    },
    ServiceRegistry: {
      all: [],
      register: () => {},
      getServices: () => ({}),
      hasServices: () => false
    },
    workspace: {}
  };

  const { multiMode, allTokens, tokenDict } = buildMultiModeTokens();
  const lexer = new MultiModeLexer(multiMode, tokenDict);

  const coreServices = {
    Grammar: grammar,
    LanguageMetaData: ProperLangLanguageMetaData,
    parser: {
      Lexer: lexer,
      LexerErrorMessageProvider: lexerErrorMessageProvider,
      ErrorMessageProvider: parserErrorMessageProvider,
      ParserErrorMessageProvider: parserErrorMessageProvider,
      TokenBuilder: new DefaultTokenBuilder(),
      LangiumProfiler: langiumProfiler,
      ValueConverter: {
        convert: (value: any) => value
      },
      GrammarConfig: {
        entryRule: 'Program'
      }
    } as any,
    references: {
      Linker: {
        link: () => {}
      },
      NameProvider: {
        getName: () => ''
      }
    },
    shared: sharedServices
  };

  const parser = new LangiumParser(coreServices as any);

  createParser(grammar, parser, tokenDict);
  parser.finalize();

  return parser;
}
