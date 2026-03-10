import type { AstNode, ValidationAcceptor, ValidationChecks } from 'langium';
import type { ProperLangAstType, ArrowExpr, FnDecl, Expr } from './generated/language-server/ast.js';
import { isArrowExpr, isFnDecl } from './generated/language-server/ast.js';

export interface ValidationError {
  message: string;
  node: AstNode;
  property: string;
}

function isCallbackArg(node: ArrowExpr | FnDecl): boolean {
  const container = node.$container;
  if (container && 'args' in container) {
    const args = (container as { args: Expr[] }).args;
    return args.includes(node as unknown as Expr);
  }
  return false;
}

function checkParamConstraints(
  node: ArrowExpr | FnDecl,
  accept: ValidationAcceptor
): void {
  const isCallback = isCallbackArg(node);

  for (const param of node.params) {
    if (!param.constraint && !isCallback) {
      accept('error', `Parameter '${param.name}' must have a type constraint when not in callback context`, {
        node: param,
        property: 'name'
      });
    }
  }
}

export function validate(root: AstNode): ValidationError[] {
  const errors: ValidationError[] = [];

  const accept: ValidationAcceptor = (severity, message, info) => {
    if (severity === 'error') {
      errors.push({
        message,
        node: info.node,
        property: info.property ?? ''
      });
    }
  };

  const visited = new Set<AstNode>();

  function traverse(node: AstNode): void {
    if (visited.has(node)) return;
    visited.add(node);

    if (isArrowExpr(node) || isFnDecl(node)) {
      checkParamConstraints(node, accept);
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object' && '$type' in item) {
              traverse(item as AstNode);
            }
          }
        } else if ('$type' in value) {
          traverse(value as AstNode);
        }
      }
    }
  }

  traverse(root);
  return errors;
}

export const ProperLangValidationChecks: ValidationChecks<ProperLangAstType> = {
  ArrowExpr: checkParamConstraints,
  FnDecl: checkParamConstraints
};
