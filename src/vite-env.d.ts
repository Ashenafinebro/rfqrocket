
/// <reference types="vite/client" />
/// <reference types="node" />
/// <reference types="@types/react" />
/// <reference types="@types/react-dom" />

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.webp'
