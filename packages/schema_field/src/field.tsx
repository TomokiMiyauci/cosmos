import type { JSX } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import type { Definition } from "./type.ts";
import StringField from "./fields/string.tsx";
import NumberField from "./fields/number.tsx";
import BooleanField from "./fields/boolean.tsx";
import MapField from "./fields/map.tsx";
import UnionField from "./fields/union.tsx";
import SequenseField from "./fields/sequence.tsx";

export interface UseFieldsReturn {
  getValues(): Value | null;
  form: UseFormReturn<FormValues, unknown, FormValues>;
}

export function useFields(): UseFieldsReturn {
  const form = useForm<FormValues>();

  return {
    getValues(): Value | null {
      return form.getValues().content ?? null;
    },

    form,
  };
}

export interface FieldsProps {
  form: UseFormReturn<FormValues, unknown, FormValues>;
  definition: Definition;
}

type Primitive = string | number | boolean;

interface FormValues {
  content: undefined | Value;
}

type Value = Value[] | Primitive | {
  [k: string]: Value;
};

export function Fields(props: FieldsProps): JSX.Element {
  return (
    <FormProvider {...props.form}>
      <Field
        definition={props.definition}
        name="content"
      />
    </FormProvider>
  );
}

export interface FieldProps {
  definition: Definition;
  name: string;
}

function Field(props: FieldProps): JSX.Element {
  const { definition, name } = props;

  switch (definition.type) {
    case "string": {
      return <StringField name={name} definition={definition} render={Field} />;
    }
    case "number": {
      return <NumberField name={name} definition={definition} render={Field} />;
    }
    case "boolean": {
      return (
        <BooleanField
          name={name}
          definition={definition}
          render={Field}
        />
      );
    }
    case "list": {
      return (
        <SequenseField name={name} definition={definition} render={Field} />
      );
    }
    case "map": {
      return <MapField name={name} definition={definition} render={Field} />;
    }
    case "union": {
      return <UnionField name={name} definition={definition} render={Field} />;
    }
  }
}
