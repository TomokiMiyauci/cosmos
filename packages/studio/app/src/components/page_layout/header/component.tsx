import type { JSX } from "react";
import { useDisclosure } from "../disclosure/component.tsx";
import style from "./style.css" with { type: "css" };
import { StyleSheet } from "~component";

export default function Header(): JSX.Element {
  const { toggle, id, isOpen } = useDisclosure();

  return (
    <>
      <StyleSheet href="header" precedence="">{style}</StyleSheet>
      <header data-component="header">
        <button
          data-component="button"
          aria-expanded={isOpen}
          aria-controls={id}
          type="button"
          onClick={toggle}
        >
          x
        </button>
      </header>
    </>
  );
}
