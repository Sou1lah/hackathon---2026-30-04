import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable

metadata = sa.MetaData()
t = sa.Table('test', metadata,
    sa.Column('status1', sa.Enum('a', 'b', name='myenum', create_type=False)),
    sa.Column('status2', postgresql.ENUM('a', 'b', name='myenum2', create_type=False))
)
print(CreateTable(t).compile(dialect=postgresql.dialect()))
