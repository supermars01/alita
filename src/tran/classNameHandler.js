/**
 * Copyright (c) Areslabs.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import traverse from "@babel/traverse";
import * as t from "@babel/types"

/**
 * 统一处理节点的类名添加
 * @param ast
 * @param info
 * @returns {*}
 */
export default function classNameHandler (ast,info) {

    traverse(ast, {
        exit: path => {
            if (path.type === 'JSXOpeningElement'
                && path.node.name.name === 'view'
            ) {
                const attris = path.node.attributes
                const original = (attris.filter(item => item.type === 'JSXAttribute' && item.name.name === 'original'))[0].value.value

                if (original === 'View'
                    || original === 'AnimatedView'
                    || original === 'AnimatedText'
                    || original === 'TouchableOpacity'
                    || original === 'TouchableHighlight'
                ) {
                    attris.push(
                        t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('view'))
                    )
                } else if (
                    original === 'OuterText'
                ) {
                    attris.push(
                        t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('text'))
                    )
                } else if (
                    original === 'InnerText'
                ) {
                    attris.push(
                        t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('textInner'))
                    )
                } else if (
                    original === 'TouchableWithoutFeedback'
                ) {
                    // do nothing
                } else {
                    attris.push(
                        t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('view'))
                    )
                }
            }

            if (path.type === 'JSXOpeningElement'
                && path.node.name.name === 'image'
            ) {
                // image 不支持包裹元素了，so, do nothing!
            }

        }

    })

    return ast
}

