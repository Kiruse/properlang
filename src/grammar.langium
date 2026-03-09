grammar ProperLang

terminal ID:     /[a-zA-Z_][\w_]*/;
terminal NUMBER: /[0-9]+e[0-9]+/ | /[0-9]*\.[0-9]+/ | /[0-9]+/;
terminal HEX:    /0x[0-9a-fA-F]+/;
terminal OCT:    /0o[0-7]+/;
terminal BIN:    /0b[01]+/;

terminal STRING_SINGLE: /'([^'\\]|\\.)*'/;
terminal STRING_DOUBLE: /"([^"\\]|\\.)*"/;
terminal TPL_FULL: '`' /(?:[^$\\]|\\.|\$(?!\{))*/ '`';
terminal TPL_START: '`' /(?:[^$\\]|\\.|\$(?!\{))*/ '${';
terminal TPL_END: '}' /(?:[^$\\]|\\.|\$(?!\{))*/ '`';
terminal TPL_BTWN: '}' /(?:[^$\\]|\\.|\$(?!\{))*/ '${';

hidden terminal WS: /\s+/;
terminal DOC_COMMENT: '/**' .* '*/';
hidden terminal LINE_COMMENT: '//' .*;
hidden terminal BLOCK_COMMENT: '/*' .* '*/';
terminal RELATION_OP: '<=' | '<' | '>=' | '>' | '==' | '!=';

entry Program: stmts+=TopLevelStmt*;

TopLevelStmt:
    Stmt
  | ImportDecl;

Stmt:
    FnDecl
  | VarDecl ';'
  | IfExpr
  | Expr ';'
  | ForStmt
  | WhileStmt
  | Literal ';'
  | ReturnStmt
  ;

ImportDecl:
    'import' kwTypes='types' 'from' path=StringLit ';' // for type compatibility imports
  | 'import' '*' 'as' name=ID 'from' path=StringLit ';'
  | 'import' name=ID ',' '{' names+=ID* '}' 'from' path=StringLit ';'
  | 'import' name=ID 'from' path=StringLit ';'
  | 'import' '{' names+=ID* '}' 'from' path=StringLit ';'
  | 'import' 'from' path=StringLit ';'
  ;
ReturnStmt: 'return' value=Expr?;

IfExpr: kw=('if' | 'unless') condition=Expr ':'? consequent=Stmt ('else' ':'? alternate=Stmt)?;

ForStmt: 'for' 'let' iterator=ID 'in' collection=Expr ':'? consequent=Stmt;
WhileStmt: 'while' condition=Expr ':'? consequent=Stmt;

Expr: BinaryExpr | PrimaryExpr;
infix BinaryExpr on PrimaryExpr:
    right assoc '**'
  > '*' | '/' | '%'
  > '+' | '-'
  > '<' | '<=' | '>' | '>=' | '==' | '!='
  > right assoc 'in' | 'is' | '!is' | 'isnt' | '!in' | 'instanceof' | '!instanceof'
  > 'or' | 'xor' | 'and' | '&&' | '||'
  ;
PrefixExpr: op=('+'|'-') operand=Expr | op=('++'|'--') operand=Accessor;
PostfixExpr: operand=Accessor op=('++'|'--');
PrimaryExpr:
    '(' expr=Expr ')'
  | value=Literal
  | expr=PrefixExpr
  | expr=PostfixExpr
  | expr=Accessor
  ;

FnDecl: doc=DOC_COMMENT? 'fn' name=ID '(' params+=Param* ')';
Param: name=ID ':' constraint=Constraint;

VarDecl:
    kw='let' name=ID ':' constraint=Constraint
  | kw=('let' | 'const') name=ID '=' value=Expr
  | kw=('let' | 'const') '{' destruct+=DestructureDecl* '}' '=' value=Expr;
DestructureDecl: name=ID (':' rename=ID)?;

Accessor: id=(ID | 'this') members+=MemberAccessor*;
MemberAccessor:
    {infer MemberPropAccessor}  nullish=('?' | '!')? '.' prop=ID
  | {infer MemberIndexAccessor} '[' index=Expr ']'
  | {infer MemberCallAccessor}  '(' args+=Expr* ')';

Literal: RangeLit | BigintLit | NumberLit | BoolLit | TemplateLit | StringLit;
RangeLit: min=RangeBound op=('..' | '...') max=RangeBound;
RangeBound: value=NUMBER | value=Accessor;
NumberLit: value=HEX | value=OCT | value=BIN | value=NUMBER;
BigintLit: value=NUMBER 'n';
BoolLit: value='true' | value='false';
StringLit: value=(STRING_SINGLE | STRING_DOUBLE);
TemplateLit:
    vals+=TPL_FULL
  | vals+=TPL_START vals+=Expr
    (vals+=TPL_BTWN vals+=Expr)*
    vals+=TPL_END;

Constraint: NumberConstraint;
NumberConstraint:
    'number' op=RELATION_OP ref=NUMBER
  | min=NUMBER op=('<' | '<=') 'number' ('<' | '<=') max=NUMBER
  | max=NUMBER op=('>' | '>=') 'number' ('>' | '>=') min=NUMBER;
