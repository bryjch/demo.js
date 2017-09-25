import {StringTable, StringTableEntry} from '../../../../Data/StringTable';
import {readFileSync} from 'fs';
import {ParserState} from '../../../../Data/ParserState';
import {StringTableHandler} from '../../../../Parser/Message/StringTable';
import {assertEncoder, assertParser, getStream} from '../Packet/PacketTest';
import {BitStream} from 'bit-buffer';

const encodeEntry = (entry: StringTableEntry) => {
	const encodeEntry: any = {
		text: entry.text,
	};
	if (entry.extraData) {
		encodeEntry.extraData = Array.from(entry.extraData.readArrayBuffer(Math.ceil(entry.extraData.length / 8)).values());
	}
	return encodeEntry;
};
const encodeTables = (tables) => {
	return tables.map((table) => {
		const encodeTable: any = {
			name: table.name,
			entries: table.entries.map(encodeEntry)
		};
		if (table.tableEntry) {
			encodeTable.tableEntry = encodeEntry(table.tableEntry);
		}
		return encodeTable;
	});
};
const decodeEntry = (entry) => {
	const decodeEntry: any = {
		text: entry.text,
	};
	if (entry.extraData) {
		decodeEntry.extraData = getStream(entry.extraData);
	}
	return decodeEntry;
};
const decodeTables = (tables) => {
	return tables.map((table) => {
		const decodeTable: any = {
			name: table.name,
			entries: table.entries.map(decodeEntry)
		};
		if (table.tableEntry) {
			decodeTable.tableEntry = decodeEntry(table.tableEntry);
		}
		return decodeTable;
	});
};

const data = Array.from(readFileSync(__dirname + '/../../../data/stringTableData.bin').values());
const expectedRaw = {
	type: 8,
	tick: 21766,
	tables: JSON.parse(readFileSync(__dirname + '/../../../data/stringTableResult.json', 'utf8'))
};

const expected = {
	type: 8,
	tick: 21766,
	tables: decodeTables(expectedRaw.tables),
	rawData: getStream('')
};


const getParserState = () => {
	return new ParserState();
};

const handler = StringTableHandler;

function parser(stream) {
	const result: any = handler.parseMessage(stream, getParserState());
	delete result.rawData;
	result.tables = encodeTables(result.tables);
	return result;
}

function encoder(message, stream) {
	handler.encodeMessage(expected, stream, getParserState());
}

suite('StringTable', () => {
	test('Parse StringTable message', () => {
		assertParser(parser, getStream(data), expectedRaw, 3690024);
	});

	test('Encode StringTable message', () => {
		assertEncoder(parser, encoder, expectedRaw, 3690024);
	});
});
