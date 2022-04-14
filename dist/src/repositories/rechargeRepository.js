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
exports.insert = exports.findByCardId = void 0;
const database_js_1 = require("../database.js");
function findByCardId(cardId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_js_1.connection.query(`SELECT * FROM recharges WHERE "cardId"=$1`, [cardId]);
        return result.rows;
    });
}
exports.findByCardId = findByCardId;
function insert(rechargeData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { cardId, amount } = rechargeData;
        database_js_1.connection.query(`INSERT INTO recharges ("cardId", amount) VALUES ($1, $2)`, [cardId, amount]);
    });
}
exports.insert = insert;
