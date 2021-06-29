/* eslint-disable require-jsdoc */
import { Column, Entity, VirtualColumn } from '../../decorators';
import { PatternModel } from './pattern.model';

@Entity({ name: 'files' })
export class FileModel extends PatternModel {

	@VirtualColumn({ canPopulate: false })
	test?: string;

	@Column()
	privateUrl?: string;

	@Column()
	publicUrl?: string;

}
