const TYPES = {
  ConfigProvider: Symbol.for('ConfigProvider'),
  UtilHelper: Symbol.for('UtilHelper'),
  AuthTokenHelper: Symbol.for('AuthTokenHelper'),

  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),

  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  DBProvider: Symbol.for('DBProvider'),
  AuthProvider: Symbol.for('AuthProvider')
};

export { TYPES };
