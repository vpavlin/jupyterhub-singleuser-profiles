from pydantic import BaseModel, ValidationError, validator
from typing import Dict, Any, Optional, List
from enum import Enum
import json
import logging
import yaml

_LOGGER = logging.getLogger(__name__)

class GpuCheckbox(BaseModel):
    value: int = 1

class GpuDropdown(BaseModel):
    start: int = 0
    end: int = 1

class GpuInput(BaseModel):
    limit: int = 1

class GpuConfig(BaseModel):
    enabled: Optional[bool] = True
    type: Optional[str] = None
    gpuCheckbox: Optional[GpuCheckbox]
    gpuDropdown: Optional[GpuDropdown]
    gpuInput: Optional[GpuInput]

    @classmethod
    def create(cls, dict_:Dict[str, Any]) -> "GpuConfig":
        if dict_.get('type') is None:
            v = None
            return cls(enabled=dict_.get('enabled'))
        if dict_['type'] == 'checkbox':
            v = GpuCheckbox(**dict_.get('gpuCheckbox', {}))
        elif dict_['type'] == 'dropdown':
            v = GpuDropdown(**dict_.get('gpuDropdown', {}))
        elif dict_['type'] == 'input':
            v = GpuInput(**dict_.get('gpuInput', {}))
        else:
            raise ValueError(f"Unknown type {dict_['type']}")
        if v == {} and dict_.get('type') is not None:
            raise ValueError("No config supplied")
        instance = cls(enabled=dict_.get('enabled'), type=dict_.get('type'), config=v)
        return instance

class ImageConfigSort(str, Enum):
    name = 'name'
    version = 'version'

class ImageConfig(BaseModel):
    blacklist: list = []
    whitelist: list = []
    sort: Optional[ImageConfigSort] = None
    #Should not be used, can lock a user out.
    #enabled: bool = True

class SizeConfig(BaseModel):
    enabled: Optional[bool] = True

class EnvVarType(str, Enum):
    text = 'text'
    password = 'password'

class EnvVar(BaseModel):
    name: str
    type: EnvVarType

class EnvVarCategory(BaseModel):
    name: str
    variables: List[EnvVar] = None

class EnvVarConfig(BaseModel):
    enabled: Optional[bool] = True
    categories: List[EnvVarCategory] = None

class UIConfigModel(BaseModel):
    gpuConfig: Optional[GpuConfig] = {}
    imageConfig: Optional[ImageConfig] = {}
    sizeConfig: Optional[SizeConfig] = {}
    envVarConfig: Optional[EnvVarConfig] = {}

class UIConfig():

    def __init__(self, ui_cfg):
        self.ui_cfg = ui_cfg
    
    def validate_ui_cm(self):
        # Unmodified or empty ui_config is a list istead of dict
        if type(self.ui_cfg) == dict:
            try:
                for key, value in self.ui_cfg.items():
                    if value is None:
                        value = {}
                    if key == "gpuConfig":
                        value = GpuConfig.create(value)
                    if key == "imageConfig":
                        value = ImageConfig(**value)
                    if key == "sizeConfig":
                        value = SizeConfig(**value)
                    if key == "envVarConfig":
                        value = EnvVarConfig(**value)
            except ValidationError as e:
                _LOGGER.error("UI ConfigMap validation failed! %s" % e)
                return {}
        else:
            return {}
        ui = UIConfigModel(**self.ui_cfg)
        return ui.dict()
