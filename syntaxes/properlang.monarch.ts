// Monarch syntax highlighting for the properlang language.
export default {
    keywords: [
        '!in','!instanceof','!is','and','as','const','else','false','fn','for','from','if','import','in','instanceof','is','isnt','let','n','number','or','return','this','true','types','unless','while','xor'
    ],
    operators: [
        '!','!=','%','&&','*','**','+','++',',','-','--','.','..','...','/',':',';','<','<=','=','==','>','>=','?','||'
    ],
    symbols: /!|!=|%|&&|\(|\)|\*|\*\*|\+|\+\+|,|-|--|\.|\.\.|\.\.\.|\/|:|;|<|<=|=|==|>|>=|\?|\[|\]|\{|\|\||\}/,

    tokenizer: {
        initial: [
            { regex: /[a-zA-Z_][\w_]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"ID"} }} },
            { regex: /[0-9]+e[0-9]+|[0-9]*\.[0-9]+|[0-9]+/, action: {"token":"NUMBER"} },
            { regex: /0x[0-9a-fA-F]+/, action: {"token":"HEX"} },
            { regex: /0o[0-7]+/, action: {"token":"OCT"} },
            { regex: /0b[01]+/, action: {"token":"BIN"} },
            { regex: /'([^'\\]|\\.)*'/, action: {"token":"STRING_SINGLE"} },
            { regex: /"([^"\\]|\\.)*"/, action: {"token":"STRING_DOUBLE"} },
            { regex: /`(?:[^$\\]|\\.|\$(?!\{))*`/, action: {"token":"TPL_FULL"} },
            { regex: /`(?:[^$\\]|\\.|\$(?!\{))*\$\{/, action: {"token":"TPL_START"} },
            { regex: /\}(?:[^$\\]|\\.|\$(?!\{))*`/, action: {"token":"TPL_END"} },
            { regex: /\}(?:[^$\\]|\\.|\$(?!\{))*\$\{/, action: {"token":"TPL_BTWN"} },
            { regex: /\/\*\*(?:[\s\S])*\*\//, action: {"token":"DOC_COMMENT"} },
            { regex: /<=|<|>=|>|==|!=/, action: {"token":"RELATION_OP"} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /\s+/, action: {"token":"white"} },
            { regex: /\/\/(?:[\s\S])*/, action: {"token":"comment"} },
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
        ],
        comment: [
            { regex: /[^/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[/\*]/, action: {"token":"comment"} },
        ],
    }
};
