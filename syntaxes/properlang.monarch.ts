// Monarch syntax highlighting for the properlang language.
export default {
    keywords: [
        '!in','!is','and','as','async','break','const','continue','declare','delete','else','export','false','fn','for','from','get','global','if','import','in','is','let','n','new','or','return','set','trait','true','type','types','unless','use','where','while','xor'
    ],
    operators: [
        '!','!=','%','%=','&','&&','*','**','*=','+','++','+=',',','-','--','-=','->','.','..','...','/','/=',':',';','<','<=','=','==','=>','>','>=','?','?=','??','|','|=','||','~'
    ],
    symbols: /!|!=|%|%=|&|&&|\(|\)|\*|\*\*|\*=|\+|\+\+|\+=|,|-|--|-=|->|\.|\.\.|\.\.\.|\/|\/=|:|;|<|<=|=|==|=>|>|>=|\?|\?=|\?\?|\[|\]|\{|\||\|=|\|\||\}|~/,

    tokenizer: {
        initial: [
            { regex: /[a-zA-Z_][\w_]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"ID"} }} },
            { regex: /[0-9]+e[0-9]+|[0-9]*\.[0-9]+|[0-9]+/, action: {"token":"NUMBER"} },
            { regex: /0x[0-9a-fA-F]+/, action: {"token":"HEX"} },
            { regex: /0o[0-7]+/, action: {"token":"OCT"} },
            { regex: /0b[01]+/, action: {"token":"BIN"} },
            { regex: /\/([^\/\\\\]|\\\\.)*\/[gimsuy]*/, action: {"token":"REGEX"} },
            { regex: /'([^'\\]|\\.)*'/, action: {"token":"STRING_SINGLE"} },
            { regex: /"([^"\\]|\\.)*"/, action: {"token":"STRING_DOUBLE"} },
            { regex: /`(?:[^$\\]|\\.|\$(?!\{))*`/, action: {"token":"TPL_FULL"} },
            { regex: /`(?:[^$\\]|\\.|\$(?!\{))*\$\{/, action: {"token":"TPL_START"} },
            { regex: /\}(?:[^$\\]|\\.|\$(?!\{))*`/, action: {"token":"TPL_END"} },
            { regex: /\}(?:[^$\\]|\\.|\$(?!\{))*\$\{/, action: {"token":"TPL_BTWN"} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /\/\/\/\/\/!/, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\//, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
            { regex: /\s+/, action: {"token":"white"} },
        ],
        comment: [
            { regex: /[^/////!]+/, action: {"token":"comment"} },
            { regex: /\n/, action: {"token":"comment","next":"@pop"} },
            { regex: /[/////!]/, action: {"token":"comment"} },
            { regex: /[^//]+/, action: {"token":"comment"} },
            { regex: /\n/, action: {"token":"comment","next":"@pop"} },
            { regex: /[//]/, action: {"token":"comment"} },
            { regex: /[^/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[/\*]/, action: {"token":"comment"} },
        ],
    }
};
