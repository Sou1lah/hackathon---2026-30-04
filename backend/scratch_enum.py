from sqlalchemy import Enum
e = Enum('draft', name='internshipstatus', create_type=False)
print(e.create_type)
