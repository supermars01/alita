/**
 * Copyright (c) Areslabs.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * 微信小程序的自定义组件会退化为一个节点， 所以需要把内部的节点样式上报给这个退化生成的节点
 *
 * renderNextValidComps 和 render 过程，inst 上报的方式是不一样的
 *
 * 被renderNextValidComps 调用的实例， 一定是组件本身调用了setState / forceUpdate节点，且这个节点是被 上层节点的shouldUpdate 等于
 * false截断
 *
 * 被render 调用的实例一定是上层递归下来的节点，即render的节点 nextProps !== props
 *
 * 所有renderNextValidComps过程中，parent（inst._p） 节点的_r 数据一定是存在的，当子组件的新 outStyle 没有产生改变的时候，是不需要
 * 上报样式的
 */

import {DEFAULTCONTAINERSTYLE, setDeepData} from "./util";
import {STYLE_EFFECT, STYLE_WXINIT_EFFECT, mpRoot} from "./constants";
import {unshiftEffect} from './effect'

/**
 * renderNextValidComps 过程的节点，其父_r 数据都是存在的，所以在样式没有变化的时候，不需要上报
 * @param inst
 */
export function rnvcReportExistStyle(inst) {
    if (inst === mpRoot || inst.isPageComp) {
        // 页面组件不需要上报
        if (inst.styleEffect) {
            unshiftEffect({
                inst,

                tag: STYLE_EFFECT,
                data: inst.styleEffect
            })

            inst.styleEffect = undefined
        }
        return
    }



    const styleKey = inst._styleKey
    const styleValue = inst._r[styleKey]

    // 说明此组件是连锁上报的中间组件
    if (styleValue !== DEFAULTCONTAINERSTYLE) {
        inst._r[styleKey] = DEFAULTCONTAINERSTYLE

        if (styleValue !== inst._myOutStyle) {

            if (inst._myOutStyle === false) {
                // 组件从 render null 改变为render element，将导致小程序节点的初始化
                unshiftEffect({
                    tag: STYLE_WXINIT_EFFECT,
                    inst
                })
            }


            inst._myOutStyle = styleValue
            setDeepData(inst._p, styleValue, inst._outStyleKey)

            const styleEffect = (inst._p.styleEffect = inst._p.styleEffect || {})
            styleEffect[inst._outStyleKey] = styleValue
        }

        // 连锁上报的中间组件不需要更新操作
        inst.styleEffect = undefined
    }

    if (inst.styleEffect) {
        unshiftEffect({
            inst,

            tag: STYLE_EFFECT,
            data: inst.styleEffect
        })

        inst.styleEffect = undefined
    }
}

/**
 * renderNextValidComps 过程的节点，其父_r 数据都是存在的，所以在样式没有变化的时候，不需要上报
 * @param inst
 * @param effect
 */
export function rnvcReportStyle(inst, effect) {
    if (inst === mpRoot || inst.isPageComp) {
        // 页面组件不需要上报
        return
    }

    const styleKey = inst._styleKey
    let styleValue
    if (styleKey) {
        styleValue = inst._r[styleKey]
        inst._r[styleKey] = DEFAULTCONTAINERSTYLE
    } else {
        styleValue = false
    }

    if (styleValue !== inst._myOutStyle) {
        if (inst._myOutStyle === false) {
            // 组件从 render null 改变为render element，将导致小程序节点的初始化
            effect.hasMpInit = true
        }

        inst._myOutStyle = styleValue
        setDeepData(inst._p, styleValue, inst._outStyleKey)

        const styleEffect = (inst._p.styleEffect = inst._p.styleEffect || {})
        styleEffect[inst._outStyleKey] = styleValue
    }
}

/**
 * render过程的节点，其父的_r 字段 已经清空，所以不管什么情况，都需要setDeepData
 *
 * @param inst
 */
export function rReportExistStyle(inst) {
    if (inst === mpRoot || inst.isPageComp) {
        if (inst.styleEffect) {
            unshiftEffect({
                inst,

                tag: STYLE_EFFECT,
                data: inst.styleEffect
            })
            inst.styleEffect = undefined
        }
        return
    }

    const styleKey = inst._styleKey
    if (styleKey) {
        // 被child 上报影响
        if (inst._r[styleKey] !== DEFAULTCONTAINERSTYLE) {

            if (inst._r[styleKey] !== false && inst._myOutStyle === false) {
                // 组件从 render null 改变为render element，将导致小程序节点的初始化
                unshiftEffect({
                    tag: STYLE_WXINIT_EFFECT,
                    inst
                })
            }
            
            
            inst._myOutStyle = inst._r[styleKey]
            inst._r[styleKey] = DEFAULTCONTAINERSTYLE

            // 被child 上报影响 说明此组件是连锁上报的中间组件，不需要更新操作
            inst.styleEffect = undefined
        }
    } else {
        inst._myOutStyle = false
    }

    setDeepData(inst._p, inst._myOutStyle, inst._outStyleKey)


    if (inst.styleEffect) {
        unshiftEffect({
            inst,

            tag: STYLE_EFFECT,
            data: inst.styleEffect
        })
        inst.styleEffect = undefined
    }
}

/**
 * render过程的节点，其父的_r 字段 已经清空，所以不管什么情况，都需要setDeepData
 * @param inst
 * @param effect
 */
export function rReportStyle(inst, effect) {
    if (inst === mpRoot || inst.isPageComp) {
        // 页面组件不需要上报
        return
    }

    const styleKey = inst._styleKey
    if (styleKey) {
        if (inst._r[styleKey] !== false && inst._myOutStyle === false ) {
            // 组件从 render null 改变为render element，将导致小程序节点的初始化
            effect.hasMpInit = true
        }


        inst._myOutStyle = inst._r[styleKey]
        inst._r[styleKey] = DEFAULTCONTAINERSTYLE
    } else {
        inst._myOutStyle = false
    }
    
    setDeepData(inst._p, inst._myOutStyle, inst._outStyleKey)
}

