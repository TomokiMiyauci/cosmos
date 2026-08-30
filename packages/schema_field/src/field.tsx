import type { JSX } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import type { Definition } from "./type.ts";
import StringField from "./fields/string.tsx";
import NumberField from "./fields/number.tsx";
import BooleanField from "./fields/boolean.tsx";
import MapField from "./fields/map.tsx";
import UnionField from "./fields/union.tsx";
import SequenseField from "./fields/sequence.tsx";
import type { FieldLayoutProps, FieldProps } from "./fields/type.ts";

export interface UseFieldsReturn {
  getValues(): Value | null;
  setError(error: FieldError): void;
  form: UseFormReturn<FormValues, unknown, FormValues>;
}

export type Path = (string | number)[];

export function useFields(): UseFieldsReturn {
  const form = useForm<FormValues>();

  return {
    getValues(): Value | null {
      return normalize(form.getValues());
    },

    setError(error: FieldError): void {
      form.setError(`content`, { message: error.message });
    },

    form,
  };
}

export interface FieldError {
  path: Path;
  message: string;
}

function normalize(value: FormValues): Value | null {
  const { content } = value;

  if (content === undefined) return null;

  return normalizeNativeFormValue(content);
}

function normalizeNativeFormValue(value: NativeFormValue): Value {
  if (Array.isArray(value)) {
    return value.map(normalizeNativeFormValue);
  } else if (typeof value === "object") {
    const result: Record<string, Value> = {};

    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        result[key] = normalizeNativeFormValue(val);
      }
    }

    return result;
  } else {
    return value;
  }
}

export interface FieldsProps {
  form: UseFormReturn<FormValues, unknown, FormValues>;
  definition: Definition;
}

type Primitive = string | number | boolean;

interface FormValues {
  content: undefined | NativeFormValue;
}

type NativeFormPrimitiveValue = Primitive;

type NativeFormValue = NativeFormPrimitiveValue | {
  [k: string]: NativeFormValue | undefined;
} | NativeFormValue[];

export type Value = Value[] | Primitive | {
  [k: string]: Value;
};

export function Fields(props: FieldsProps): JSX.Element {
  return (
    <FormProvider {...props.form}>
      <_Field
        definition={props.definition}
        name="content"
      />
    </FormProvider>
  );
}

interface _FieldProps {
  definition: Definition;
  name: string;
}

function FieldLayout(props: FieldLayoutProps): JSX.Element {
  const { title, control, error } = props;

  return (
    <>
      <label>
        <p>{title}</p>

        {control}
      </label>

      {error && <p>{error}</p>}
    </>
  );
}

function _Field(props: _FieldProps): JSX.Element {
  const { definition, name } = props;

  const fieldProps = {
    name,
    definition,
    render: _Field,
    layout: FieldLayout,
  } satisfies FieldProps;

  switch (definition.type) {
    case "string": {
      return <StringField {...fieldProps} />;
    }
    case "number": {
      return <NumberField {...fieldProps} />;
    }
    case "boolean": {
      return <BooleanField {...fieldProps} />;
    }
    case "list": {
      return <SequenseField {...fieldProps} />;
    }
    case "map": {
      return <MapField {...fieldProps} />;
    }
    case "union": {
      return <UnionField {...fieldProps} />;
    }
  }
}
