 import { useState } from 'react';
import './Counter.css'
export default function CounterBtns()
{
    const [count,setCount] = useState(0);
function increment(val)
{
    setCount(count+val);
    console.log("operation");
}

return (
  <>
   <span>{count}</span>
      <Counter by={1} operation={increment}/>
      <Counter by={-1} operation={increment}/>
      <Counter by={+3} operation={increment}/>
      <Counter by={-3} operation={increment}/>
      <Counter by={+5} operation={increment}/>
      <Counter by={-5} operation={increment}/>
  </>
)
}
function Counter({by,operation})
{
    function Child()
    {
        operation(by);
    }
    
 return (
    <div className="CounterContainer">
       
        <button className="CounterBtn" onClick={Child}>{by}</button>
        
    </div>

 );
}

 