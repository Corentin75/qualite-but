import { useState } from "react";

import type { ButtonMultiStore } from "src/stores/buttonActionEmail.store";

import "./buttonMulti.scss";

type ButtonMultiProps = { source: () => ButtonMultiStore }

export default function ButtonMulti({ source }: ButtonMultiProps) {

  const [chooseAction, setChooseAction]              = useState<boolean>(false);
  const { currentAction, options, setCurrentAction } = source();

   function handleChange (id:number) {
    setCurrentAction(id);
    setChooseAction(false);
  };
  function changeAction() {
    return (
      <ul>
        {options.map((option, index) => (
          <li key={index} onClick={()=>handleChange(index)}>
            {option}
          </li>
        ))}
      </ul>
    )
  }

  function showAction() {
    return (<>
      {options[currentAction]}<span onClick={() => setChooseAction(true)}>&#11206; </span>
    </>)
  }
  return (
    <button className="buttonMulti" aria-label={`Action : ${options[currentAction]}`} aria-expanded={chooseAction}>
      { chooseAction ? changeAction() : showAction() }
    </button>
  );
}