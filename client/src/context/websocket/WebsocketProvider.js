import React, { useState, useEffect, useContext } from 'react';
import authContext from '../auth/authContext';
import SocketContext from './socketContext';
import io from 'socket.io-client';
import {
  DISCONNECT,
  FETCH_LOBBY_INFO,
  PLAYERS_UPDATED,
  RECEIVE_LOBBY_INFO,
  TABLES_UPDATED,
} from '../../pokergame/actions';

const WebSocketProvider = ({ children }) => {
  const { isLoggedIn } = useContext(authContext);

  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);

  function cleanUp() {
    socket.emit(DISCONNECT);
    socket.close();
    setSocket(null);
    setSocketId(null);
  }

  function connect() {
    const socket = io('http://localhost:5000/');
    registerCallbacks(socket);
    setSocket(socket);
    return socket;
  }

  function registerCallbacks(socket) {
    socket.on(RECEIVE_LOBBY_INFO, ({ tables, players, socketId }) => {
      console.log(RECEIVE_LOBBY_INFO, tables, players, socketId);
      setSocketId(socketId);
    });

    socket.on(PLAYERS_UPDATED, (players) => {
      console.log(PLAYERS_UPDATED, players);
    });

    socket.on(TABLES_UPDATED, (tables) => {
      console.log(TABLES_UPDATED, tables);
    });
  }

  useEffect(() => {
    connect();

    window.onclose = () => cleanUp();
    window.onunload = () => cleanUp();

    return () => {
      cleanUp();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.token;
      const webSocket = socket || connect();

      token && webSocket && webSocket.emit(FETCH_LOBBY_INFO, token);
    }
    // eslint-disable-next-line
  }, [isLoggedIn]);

  return (
    <SocketContext.Provider value={{ socket, socketId, cleanUp }}>
      {children}
    </SocketContext.Provider>
  );
};

export default WebSocketProvider;