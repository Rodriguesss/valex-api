"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.insert = exports.findByCardDetails = exports.findByTypeAndEmployeeId = exports.findById = exports.find = void 0;
const database_js_1 = require("../database.js");
const sqlUtils_js_1 = require("../utils/sqlUtils.js");
function find() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_js_1.connection.query("SELECT * FROM cards");
        return result.rows;
    });
}
exports.find = find;
function findById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_js_1.connection.query("SELECT * FROM cards WHERE id=$1", [id]);
        return result.rows[0];
    });
}
exports.findById = findById;
function findByTypeAndEmployeeId(type, employeeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_js_1.connection.query(`SELECT * FROM cards WHERE type=$1 AND "employeeId"=$2`, [type, employeeId]);
        return result.rows[0];
    });
}
exports.findByTypeAndEmployeeId = findByTypeAndEmployeeId;
function findByCardDetails(number, cardholderName, expirationDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_js_1.connection.query(` SELECT 
        * 
      FROM cards 
      WHERE number=$1 AND "cardholderName"=$2 AND "expirationDate"=$3`, [number, cardholderName, expirationDate]);
        return result.rows[0];
    });
}
exports.findByCardDetails = findByCardDetails;
function insert(cardData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { employeeId, number, cardholderName, securityCode, expirationDate, password, isVirtual, originalCardId, isBlocked, type, } = cardData;
        database_js_1.connection.query(`
    INSERT INTO cards ("employeeId", number, "cardholderName", "securityCode",
      "expirationDate", password, "isVirtual", "originalCardId", "isBlocked", type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
            employeeId,
            number,
            cardholderName,
            securityCode,
            expirationDate,
            password,
            isVirtual,
            originalCardId,
            isBlocked,
            type,
        ]);
    });
}
exports.insert = insert;
function update(id, cardData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { objectColumns: cardColumns, objectValues: cardValues } = (0, sqlUtils_js_1.mapObjectToUpdateQuery)({
            object: cardData,
            offset: 2,
        });
        database_js_1.connection.query(`
    UPDATE cards
      SET ${cardColumns}
    WHERE $1=id
  `, [id, ...cardValues]);
    });
}
exports.update = update;
function remove(id) {
    return __awaiter(this, void 0, void 0, function* () {
        database_js_1.connection.query("DELETE FROM cards WHERE id=$1", [id]);
    });
}
exports.remove = remove;
