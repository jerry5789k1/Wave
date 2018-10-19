import React, { Component } from 'react';
import axios from 'axios';//make request to server cuz they run at different port 



class App extends Component {
  componentDidMount(){
    axios.get('/api/product/brand',(response)=>{
      console.log(response)
    })

  }

  render() {
    return (
      <div className="App">

      </div>
    );
  }
}

export default App;
