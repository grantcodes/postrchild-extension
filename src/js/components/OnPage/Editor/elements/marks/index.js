import React from 'react'
import { MdFormatBold } from 'react-icons/md'
import basicMark from './basic'

export const code = basicMark('code', 'code', null)

export const strong = basicMark('bold', 'strong', <MdFormatBold />)

export const u = basicMark('underline', 'u', null)

export const em = basicMark('italic', 'em', null)
