/**
 * React-Serialize utility re-written in TypeScript
 * Originally created by @pravdomil (https://github.com/pravdomil/react-serialize)
 */
import * as React from 'react';

type ObjectType = {
    [index: string]: any;
}

type DeserializableComponent = {
    type: string;
    props: { children: DeserializableComponent[]; } & ObjectType
}

type ReviverOptions = {
    type: string | React.ComponentType,
    props: { children: DeserializableComponent[] & ObjectType },
    key: string | number,
    components: { [type: string]: React.ComponentType }
}

type DeserializationOpts = {
    components?: { [type: string]: React.ComponentType };
    reviver?: (args: ReviverOptions) => ReviverOptions
}

function deserializeElement(element: DeserializableComponent[] | DeserializableComponent | string | null, options: DeserializationOpts = {}, key?: string | number): any {
    let { components = {}, reviver } = options
  
    if (typeof element !== "object") {
      return element
    }
  
    if (element === null) {
      return element
    }
  
    if (element instanceof Array) {
      return element.map((el, i) => deserializeElement(el, options, i))
    }
  
    let { props } = element;
    const elementType = element.type;
  
    if (typeof elementType !== "string") {
      throw new Error("Deserialization error: element type must be string")
    }
  
    let type = components[elementType] || elementType.toLowerCase()
  
    if (props.children) {
      props = { ...props, children: deserializeElement(props.children, options) }
    }
  
    if (reviver) {
      ({ type, props, key, components } = reviver({ type, props, key, components }))
    }
  
    return React.createElement(type, { ...props, key })
  }

export const serialize = <T extends React.Component | JSX.Element>(component: T) => {
    const getName = (value: string | Function) => {
        if (typeof value === 'string') {
            return value
        } else if (typeof value === 'function') {
            return value.name
        }
        return value
    }
    const replacer = (key: string, value: any) => {
        switch (key) {
            case "type":
                return getName(value);
            case "_owner":
            case "_store":
            case "ref":
            case "key":
            return
            default:
            return value
        }
    }

    return JSON.stringify(component, replacer);
}

export const deserialize = <T extends React.ReactElement<any>>(serializedComponent: string, options?: DeserializationOpts): T => {
    const componentData = JSON.parse(serializedComponent);

    return deserializeElement(componentData, options) as T;
}