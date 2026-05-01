import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable

metadata = sa.MetaData()
t = sa.Table('test', metadata,
    sa.Column('status', postgresql.ENUM('a', 'b', name='myenum', create_type=False))
)
print(CreateTable(t).compile(dialect=postgresql.dialect()))
