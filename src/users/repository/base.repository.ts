import { ClientSession, PipelineStage } from 'mongoose';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@constants/general.constants';

export class BaseRepository {
  private readonly collectionName;

  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async createDocument(value: any) {
    const newDocument = new this.collectionName(value);
    await newDocument.save();
  }

  async createAndReturnDocument(value: any) {
    const newDocument = new this.collectionName(value);
    return await newDocument.save();
  }

  async findMany(condition: any) {
    return await this.collectionName.find(condition);
  }

  async bulkInsert(data: Array<any>) {
    return await this.collectionName.insertMany(data);
  }

  async findById(_id: string) {
    return await this.collectionName.findById(_id);
  }

  async findOne(condition: any) {
    return await this.collectionName.findOne(condition);
  }

  async findByIdAndUpdate(id: string, value: any, upsert = false) {
    return await this.collectionName.findByIdAndUpdate(id, value, {
      new: true,
      upsert,
    });
  }

  async findOneAndUpdate(condition: any, value: any, upsert = false) {
    return await this.collectionName.findOneAndUpdate(condition, value, {
      upsert,
    });
  }

  async deleteMany(condition: any) {
    return await this.collectionName.deleteMany(condition);
  }

  async deleteOne(condition: any) {
    return await this.collectionName.deleteOne(condition);
  }

  async updateMany(condition: any, update: any) {
    return await this.collectionName.updateMany(condition, update);
  }

  async countDocuments() {
    return await this.collectionName.countDocuments();
  }

  async aggregatePaginate(stages: PipelineStage[] = [], paginationInput) {
    let { limit, page } = paginationInput;

    limit = limit ? limit : DEFAULT_LIMIT;
    page = page ? page : DEFAULT_PAGE;

    const skip = (page - 1) * limit;

    stages.push({
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    });

    const response = await this.collectionName.aggregate(stages);

    const { items, total } = response[0];

    const itemCount = items.length;
    const totalItems = total[0]?.count || 0;

    let totalPages = 0;
    if (totalItems) totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        currentPage: page,
        itemCount,
        itemsPerPage: limit,
        totalItems,
        totalPages,
      },
    };
  }

  async aggregate(stages: PipelineStage[]) {
    return await this.collectionName.aggregate(stages);
  }

  async deleteOneTransaction(
    condition: any,
    session: ClientSession | null = null,
  ) {
    return await this.collectionName.deleteOne(condition).session(session);
  }

  async deleteManyTransaction(
    condition: any,
    session: ClientSession | null = null,
  ) {
    return await this.collectionName.deleteMany(condition).session(session);
  }

  async updateManyTransaction(
    condition: any,
    update: any,
    session: ClientSession | null = null,
  ) {
    return await this.collectionName
      .updateMany(condition, update)
      .session(session);
  }

  async findByIdAndUpdateTransaction(
    id: string,
    value: any,
    session: ClientSession | null = null,
    upsert = false,
  ) {
    return await this.collectionName
      .findByIdAndUpdate(id, value, {
        new: true,
        upsert,
      })
      .session(session);
  }

  count(query: any = {}) {
    return this.collectionName.find(query).count();
  }

  async createDocumentTransaction(
    value: any,
    session: ClientSession | null = null,
  ) {
    const newDocument = new this.collectionName(value);
    await newDocument.save({ session });
  }
}
