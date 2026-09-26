/**
 * Socket.IO Registry
 * ------------------
 * A tiny singleton that holds the io instance after initSocket() creates it.
 * Import getIo() anywhere in the backend to emit events or inspect sockets
 * without creating circular import chains between initSocket and controllers.
 */

let _io = null;

/**
 * Called once by initSocket() to register the io instance.
 * @param {import('socket.io').Server} io
 */
export const registerIo = (io) => {
  _io = io;
};

/**
 * Returns the io instance. Throws if called before initSocket() runs.
 * @returns {import('socket.io').Server}
 */
export const getIo = () => {
  if (!_io) throw new Error("[socketRegistry] io not initialized yet");
  return _io;
};
