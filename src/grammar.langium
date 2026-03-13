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
terminal DOC_COMMENT: ('///' | '//!') /[^\n]*/ '\n';
hidden terminal LINE_COMMENT: '//' /[^\n]*/ '\n';
hidden terminal BLOCK_COMMENT: '/*' .* '*/';

entry Program: stmts+=TopLevelStmt*;

TopLevelStmt:
    Stmt
  | DeclareDecl
  | ConstraintDecl
  | ImportDecl
  | TraitDecl
  | UseDecl;

Stmt:
    FnDecl
  | VarDecl
  | IfExpr
  | ForStmt
  | WhileStmt
  | ReturnStmt ';'?
  | Block
  | Expr ';'
  ;

ImportDecl:
    // for type compatibility imports; these will be stripped out during codegen
    {infer ImportTypesDecl} 'import' 'types' 'from' path=StringLit ';'
  | {infer ImportAllDecl}   'import' '*' 'as' name=ID 'from' path=StringLit ';'
  | 'import' name=ID ',' '{' names+=ID* '}' 'from' path=StringLit ';'
  | 'import' name=ID 'from' path=StringLit ';'
  | 'import' '{' names+=ID* '}' 'from' path=StringLit ';'
  | 'import' 'from' path=StringLit ';'
  ;

DeclareDecl:
    'declare' 'global' 'const' name=ID ':' constraint=Constraint ';'
  | 'declare' 'global' 'fn' name=ID '(' args+=Arg* ')' '->' return=Constraint ';'
  | 'declare' 'const' name=ID ':' constraint=Constraint 'in' path=StringLit ';'
  | 'declare' 'fn' name=ID '(' args+=Arg* ')' '->' return=Constraint 'in' path=StringLit ';'
  | 'declare' 'global' 'type' name=ID ('{' typeParams+=ID (',' typeParams+=ID)* ','? '}')?
    ({infer DeclareClosedTypeDecl} '=' | {infer DeclareOpenTypeDecl} '<' | {infer DeclareTypeExtDecl} '|=')
    constraint=Constraint ';'
  | 'declare' 'type' name=ID '|=' constraint=Constraint 'in' path=StringLit ';'
  ;

ConstraintDecl:
    'type' name=ID ('{' typeParams+=ID (',' typeParams+=ID)* ','? '}')?
    ({infer ClosedTypeDecl} '=' | {infer OpenTypeDecl} '<')
    constraint=Constraint ';';

Block: '{' stmts+=Stmt* '}';
ReturnStmt: 'return' value=Expr?;

IfExpr: ('if' | {infer UnlessExpr} 'unless') condition=Expr ':'? consequent=Stmt ('else' ':'? alternate=Stmt)?;

ForStmt: 'for' 'let' iterator=ID 'in' collection=Expr ':'? consequent=Stmt;
WhileStmt: 'while' condition=Expr ':'? consequent=Stmt;

Expr: BinaryExpr;

infix BinaryExpr on UnaryExpr:
    right assoc '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '?='
  > right assoc 'in' | '!in' | 'is' | '!is'
  > right assoc '**'
  > '+' | '-'
  > '*' | '/' | '%'
  > '<' | '<=' | '>' | '>=' | '==' | '!='
  > 'and' | '&&' | '&'
  > 'or' | 'xor' | '||' | '|'
  ;

UnaryExpr:
    {infer PrefixExpr} op=('++'|'--') operand=Accessor
  | {infer PrefixExpr} op=('+'|'-'|'!'|'~') operand=UnaryExpr
  | {infer PostfixExpr} operand=Accessor op=('++'|'--')
  | PrimaryExpr
  ;

PrimaryExpr:
    FnDecl
  | {infer ArrowExpr} '(' (args+=Arg (',' args+=Arg)* ','?)? ')'
                      ('where' where+=Param (',' where+=Param)* ','?)?
                      '=>' body=(Expr | Block)
  | {infer TupleExpr} '(' exprs+=Expr (',' exprs+=Expr)* ')'
  | {infer NewExpr} 'new' Accessor
  | IfExpr
  | Literal
  | Accessor
  ;

FnDecl:
    'fn' name=ID? '('
    (args+=Arg (',' args+=Arg)* ','?)?
    ')' ('->' return=Constraint ('!' error=Constraint)?)?
    ('where' where+=Param (',' where+=Param)* ','?)? ':'?
    body=Stmt;
Arg:
    {infer DestructureParam} '{' (destruct+=DestructureDecl (',' destruct+=DestructureDecl)*)? '}'
  | {infer RestParam} '...' name=ID (':' constraint=Constraint)?
  | name=ID (':' constraint=Constraint)? ('=' default=Expr)?;

VarDecl:
    kw='let' name=ID ':' constraint=Constraint ';'
  | kw=('let' | 'const') name=ID '=' value=Expr ';'
  | kw=('let' | 'const') '{' (destruct+=DestructureDecl (',' destruct+=DestructureDecl)*)? '}' '=' value=Expr ';';
DestructureDecl: name=ID ('as' rename=ID)? (':' constraint=Constraint)?;

TraitDecl:
    'trait' name=ID ('>' supertype=Constraint)?
    ('where' where+=Param (',' where+=Param)* ','?)?
    '{' provides+=TraitProp* '}';
TraitProp:
    {infer TraitGetterProp} 'get' name=ID '(' ')' ':'? body=Stmt
  | {infer TraitSetterProp} 'set' name=ID '(' arg=Arg ')' ('where' where+=Param (',' where+=Param)* ','?)? ':'? body=Stmt
  | {infer TraitMethodProp} 'fn'  name=ID '(' (args+=Arg (',' args+=Arg)* ','?)? ')' ('where' where+=Param (',' where+=Param)* ','?)? ':'? body=Stmt;
UseDecl: 'use' trait=ID ('as' as=ID)? ';';

Accessor: id=ID members+=MemberAccessor*;
CallArg:
    {infer NamedArg} name=ID '=' value=Expr
  | Expr;

MemberAccessor:
    {infer MemberPropAccessor}  nullish=('?' | '!')? '.' prop=ID
  | {infer MemberIndexAccessor} nullish=('?' | '!')? '[' index=Expr ']'
  | {infer MemberCallAccessor}  nullish=('?' | '!')? '(' (args+=CallArg (',' args+=CallArg)* ','?)? ')';

Param: name=ID ('<' constraint=Constraint)?;

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

Constraint:
    BinaryConstraint
  | WhereConstraint;

ConstraintOperand:
    {infer ObjectConstraint} '{' (props+=PropConstraint (',' props+=PropConstraint)*)? ','? '}'
  | ArrowFnConstraint
  | FnConstraint
  | PrimaryConstraint;

PropConstraint: name=ID optional='?'? ':' constraint=Constraint;
ArrowFnConstraint: '(' args+=Arg* ')' '->' return=Constraint ('!' error=Constraint)? ('where' where+=Param (',' where+=Param)* ','?)?;
FnConstraint: 'fn' '(' args+=Arg* ')' ('->' return=Constraint ('!' error=Constraint)?)? ('where' where+=Param (',' where+=Param)* ','?)?;
WhereConstraint: primary=PrimaryConstraint 'where' '{' (where+=PropConstraint (',' where+=PropConstraint)*)? ','? '}';
infix BinaryConstraint on ConstraintOperand:
    '|'
  > '&'
  > '<=' | '<' | '>' | '>='
  > '!=';
PrimaryConstraint:
    {infer ArrayConstraint} TypeName '[' ']'
  | TypeName
  | Literal;
TypeName: name=ID ('{' (params+=TypeName (',' params+=TypeName)* ','?)? '}')? nullable='?'?;
