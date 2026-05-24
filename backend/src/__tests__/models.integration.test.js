// Integration test for User and Task models using SQLite in-memory
const { Sequelize, DataTypes } = require('sequelize');

let sequelize, User, Task;

describe('Sequelize model integration', () => {
  beforeAll(async () => {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
    // Define User
    User = sequelize.define('User', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'users', timestamps: false });
    // Define Task
    Task = sequelize.define('Task', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'pending' }
    }, { tableName: 'tasks', timestamps: false });
    // Associations
    User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
    Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('can create and fetch User', async () => {
    const user = await User.create({ email: 'a@b.com', name: 'Alice' });
    const found = await User.findByPk(user.id);
    expect(found.email).toBe('a@b.com');
  });

  test('can create Task and associate with User', async () => {
    const user = await User.create({ email: 'b@b.com', name: 'Bob' });
    const task = await Task.create({ userId: user.id, title: 'Test Task' });
    const fetched = await Task.findOne({ where: { id: task.id }, include: 'user' });
    expect(fetched.user.id).toBe(user.id);
  });

  test('User.tasks association works', async () => {
    const user = await User.create({ email: 'c@b.com', name: 'Carol' });
    await Task.create({ userId: user.id, title: 'T1' });
    await Task.create({ userId: user.id, title: 'T2' });
    const withTasks = await User.findOne({ where: { id: user.id }, include: 'tasks' });
    expect(withTasks.tasks.length).toBe(2);
  });
});
