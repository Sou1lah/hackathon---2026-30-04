import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

metadata = sa.MetaData()
t = sa.Table('test', metadata,
    sa.Column('status1', sa.Enum('a', 'b', name='myenum', create_type=False)),
    sa.Column('status2', postgresql.ENUM('a', 'b', name='myenum2', create_type=False))
)

from sqlalchemy.schema import CreateTable
from sqlalchemy import create_engine
engine = create_engine('postgresql://postgres:postgres@localhost/postgres')
metadata.create_all(engine, checkfirst=False)
