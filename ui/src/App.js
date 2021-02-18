import './App.css';
import Container from '@material-ui/core/Container'
import MainRouter from "./MainRouter";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>OttoCar Subscriptions</h1>
      </header>
        <Container maxWidth="lg">
            <MainRouter></MainRouter>
        </Container>
    </div>
  );
}

export default App;
