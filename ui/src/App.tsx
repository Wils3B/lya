import logo from '/logo_fullname.svg'
import classes from './App.module.css'

function App() {
  return (
    <div className={classes.root}>
      <img src={logo} className={classes.logo} alt="Logo" />
    </div>
  )
}

export default App
