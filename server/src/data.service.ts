import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ITokens } from './interfaces/ITokens';
import { Tokens } from './models/tokens.model';

@Injectable()
export class DataService {
  constructor(
    @InjectModel(Tokens)
    private repository: typeof Tokens,
  ) {
    this.loadData();
  }

  private _data: ITokens;

  public get data(): ITokens {
    return this._data;
  }

  public async updateData(data: ITokens) {
    this._data = data;
    await this.saveData();
  }

  private async loadData() {
    try {
      this._data = await this.repository.findByPk(1);
    } catch (e) {
      console.log(`READ TOKENS ERROR: ${e}`);
    }
  }

  private async saveData() {
    try {
      const data = await this.repository.findByPk(1);
      if (data) {
        data.access_token = this._data.access_token;
        data.refresh_token = this._data.refresh_token;
        await data.save();
      } else {
        await this.repository.create({
          access_token: this._data.access_token,
          refresh_token: this._data.refresh_token,
        });
      }
    } catch (e) {
      console.log(`WRITE TOKENS ERROR: ${e}`);
    }
  }
}
