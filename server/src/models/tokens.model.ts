import { Column, Model, Table, DataType } from 'sequelize-typescript';

interface TokensCreationAttrs {
  access_token: string;
  refresh_token: string;
}

@Table({ timestamps: false, initialAutoIncrement: '1' })
export class Tokens extends Model<Tokens, TokensCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING(1000), allowNull: true })
  access_token: string;

  @Column({ type: DataType.STRING(1000), allowNull: true })
  refresh_token: string;
}
