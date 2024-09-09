import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// ファイルから型定義を読み込む
const sourceCode = fs.readFileSync(path.join(__dirname, '../src/generated/schema.ts'), 'utf8');

// TypeScriptのソースファイルを作成
const sourceFile = ts.createSourceFile(path.join(__dirname, '../src/generated/schema.formatted.ts'), sourceCode, ts.ScriptTarget.ES2015, true);

// ASTを操作するための変換関数
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (
  rootNode: T
) => {
  function visit(node: ts.Node): ts.Node {
    node = ts.visitEachChild(node, visit, context);
    // Optionalなプロパティを見つけたら、型に`| null`を追加
    if (ts.isPropertySignature(node) && node.questionToken) {
      const type = node.type;
      if (type) {
        const unionType = ts.factory.createUnionTypeNode([
          type, 
          ts.factory.createLiteralTypeNode(ts.factory.createNull())
        ]);
        return ts.factory.updatePropertySignature(node, node.modifiers, node.name, node.questionToken, unionType);
      }
    }
    return node
  };
  return ts.visitNode(rootNode, visit);
}

// 変換を実行
const result = ts.transform(sourceFile, [transformer]);
const printer = ts.createPrinter();
const transformedSourceCode = printer.printFile(result.transformed[0] as ts.SourceFile);

fs.writeFileSync(path.join(__dirname, '../src/generated/schema.formatted.ts'), transformedSourceCode)

console.log("generated /src/generated/schema.formatted.ts");
